import { NextRequest } from "next/server";
import { SYSTEM_PROMPT, parsePlan } from "@/lib/agent";

const OLLAMA = process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434";

export async function POST(req: NextRequest) {
  const { dream, archetype, projectName, history } = await req.json();
  const prompt = `${SYSTEM_PROMPT}\nDream: ${dream}\nArchetype: ${archetype}\nName: ${projectName}\nHistory: ${(history ?? []).slice(-4).join(" | ")}`;
  try {
    const r = await fetch(`${OLLAMA}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: process.env.OLLAMA_MODEL ?? "qwen2.5-coder:7b-instruct", prompt, stream: false, options: { num_predict: 600 } }),
    });
    if (!r.ok) throw new Error(`ollama ${r.status}`);
    const j = await r.json();
    const plan = parsePlan(j.response ?? "", archetype, projectName);
    return Response.json({ plan, local: true, model: process.env.OLLAMA_MODEL ?? "qwen2.5-coder:7b-instruct" });
  } catch (e: any) {
    const { buildFallbackPlan } = await import("@/lib/agent");
    return Response.json({ plan: buildFallbackPlan(archetype, projectName), local: true, fallback: true, error: String(e?.message ?? e) });
  }
}

export async function GET() {
  try {
    const r = await fetch(`${OLLAMA}/api/tags`);
    const j = await r.json();
    return Response.json({ online: true, models: (j.models ?? []).map((m: any) => m.name) });
  } catch {
    return Response.json({ online: false, models: [] });
  }
}
