// opencode-style agent loop, local-first. LLM proposes JSON tool calls, user approves, sidecar executes.
export interface ToolCall { tool: string; args: Record<string, any>; label: string; }
export interface AgentPlan { thought: string; steps: ToolCall[]; }

const ALLOW = new Set(["template.apply", "fs.write", "fs.read", "shell.exec", "project.install", "project.preview"]);

export function buildFallbackPlan(archetype: string, name: string): AgentPlan {
  return {
    thought: `No local LLM reachable. Scripted fallback: scaffold ${archetype} template as ${name}, install, preview. Guarantees working demo offline.`,
    steps: [
      { tool: "template.apply", args: { archetype, name }, label: `Apply ${archetype} template → ${name}` },
      { tool: "project.install", args: { cmd: "npm install", cwd: `dream/${name}` }, label: "npm install (allowlisted)" },
      { tool: "project.preview", args: { cwd: `dream/${name}` }, label: "Start preview + export zip" },
    ],
  };
}

export function parsePlan(text: string, archetype: string, name: string): AgentPlan {
  try {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return buildFallbackPlan(archetype, name);
    const j = JSON.parse(m[0]);
    const steps = (j.steps ?? []).filter((s: ToolCall) => ALLOW.has(s.tool)).slice(0, 6);
    if (steps.length === 0) return buildFallbackPlan(archetype, name);
    return { thought: String(j.thought ?? "").slice(0, 500), steps };
  } catch {
    return buildFallbackPlan(archetype, name);
  }
}

export const SYSTEM_PROMPT = `You are DreamBuild local agent. Output ONLY JSON: {"thought":"...","steps":[{"tool":"template.apply|fs.write|shell.exec|project.install|project.preview","args":{},"label":"..."}]}. Rules: max 5 steps, shell.exec cmd must be one of: npm install, npm run dev, ollama pull, ollama list, npx convex dev --once. cwd always under dream/. Prefer template.apply first.`;
