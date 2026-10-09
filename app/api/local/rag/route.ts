import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { search, chunkText, type Chunk } from "@/lib/rag";
import { STACKS } from "@/lib/stacks";

// Local template index (ships with repo, no internet)
async function loadTemplates(): Promise<Chunk[]> {
  const base = path.join(process.cwd(), "templates");
  const out: Chunk[] = [];
  try {
    const archs = await fs.readdir(base);
    for (const a of archs) {
      try {
        const meta = await fs.readFile(path.join(base, a, "template.json"), "utf8").catch(() => "{}");
        out.push(...chunkText(`${a} ${meta}`.slice(0, 2000), `template:${a}`));
      } catch {}
    }
  } catch {}
  for (const s of STACKS) out.push(...chunkText(`${s.name} ${s.cost} ${s.freeLimit} pros ${s.pros.join(",")} cons ${s.cons.join(",")} when ${s.whenToPick}`, `stack:${s.id}`));
  return out;
}

export async function POST(req: NextRequest) {
  const { query, extra } = await req.json();
  const idx = await loadTemplates();
  const extras: Chunk[] = extra ? chunkText(String(extra).slice(0, 4000), "user-context") : [];
  const all = [...idx, ...extras];
  if (all.length === 0) return Response.json({ hits: [], local: true });
  const hits = search(all, String(query ?? "").slice(0, 500), 5);
  return Response.json({ hits: hits.map((h) => ({ id: h.id, text: h.text.slice(0, 400), source: h.source })), local: true });
}
