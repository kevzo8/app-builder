import { NextRequest } from "next/server";
import { hashVec, chunkText } from "@/lib/rag";

const OLLAMA = process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434";

export async function POST(req: NextRequest) {
  const { texts, source } = await req.json();
  const list: string[] = Array.isArray(texts) ? texts : [String(texts ?? "")];
  // Try Ollama embeddings, fallback to hashVec (offline-safe)
  try {
    const out: number[][] = [];
    for (const t of list) {
      const r = await fetch(`${OLLAMA}/api/embed`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: process.env.OLLAMA_EMBED ?? "nomic-embed-text", input: t.slice(0, 2000) }),
      });
      if (!r.ok) throw new Error("embed fail");
      const j = await r.json();
      out.push(j.embeddings?.[0] ?? hashVec(t, 768));
    }
    return Response.json({ vectors: out, local: true, engine: "ollama" });
  } catch {
    return Response.json({ vectors: list.map((t) => hashVec(t)), local: true, engine: "hash-fallback", chunks: chunkText(list.join("\n"), source ?? "upload").length });
  }
}
