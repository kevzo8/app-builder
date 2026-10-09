// Minimal local RAG: chunk text, hash-embed fallback, cosine search.
// Primary embeddings come from Ollama nomic-embed-text via /api/local/embed.
// Fallback here is a deterministic char-hash vector so demo works offline with no model.

export interface Chunk { id: string; text: string; source: string; vec: number[]; }

const DIM = 128;
export function hashVec(text: string, dim = DIM): number[] {
  const v = new Array(dim).fill(0);
  const t = text.toLowerCase();
  for (let i = 0; i < t.length; i++) {
    const c = t.charCodeAt(i);
    v[c % dim] += 1;
    v[(c * 7 + i) % dim] += 0.5;
  }
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => x / norm);
}

export function chunkText(text: string, source: string, size = 500): Chunk[] {
  const out: Chunk[] = [];
  const clean = text.replace(/\s+/g, " ").trim();
  for (let i = 0, k = 0; i < clean.length; i += size, k++) {
    const slice = clean.slice(i, i + size);
    if (!slice.trim()) continue;
    out.push({ id: `${source}#${k}`, text: slice, source, vec: hashVec(slice) });
  }
  return out;
}

export function cosine(a: number[], b: number[]): number {
  let s = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) s += a[i] * b[i];
  return s;
}

export function search(chunks: Chunk[], query: string, topK = 4): Chunk[] {
  const q = hashVec(query, chunks[0]?.vec.length ?? DIM);
  return [...chunks]
    .map((c) => ({ c, s: cosine(c.vec.length === q.length ? c.vec : hashVec(c.text, q.length), q) }))
    .sort((x, y) => y.s - x.s)
    .slice(0, topK)
    .map((x) => x.c);
}

export function classifyArchetype(dream: string): "sell" | "teach" | "serve" | "showcase" | "present" | "evite" {
  const t = dream.toLowerCase();
  if (/present|slide|deck|pitch|talk|keynote|powerpoint|demo day/.test(t)) return "present";
  if (/invit|wedding|birthday|binyag|debut|rsvp|christening|baptism/.test(t)) return "evite";
  if (/class|school|train|lesson|quiz|xp|student|als|tutorial/.test(t)) return "teach";
  if (/book|reserve|room|villa|clinic|salon|repair|schedule|appointment/.test(t)) return "serve";
  if (/photo|portfolio|gallery|menu|church|freelance|design/.test(t)) return "showcase";
  if (/order|store|sari|shop|frozen|meat|pos|inventory/.test(t)) return "sell";
  return "sell";
}

export function improvePrompt(dream: string): string {
  const d = dream.trim().replace(/\s+/g, " ");
  return `I want an app for ${d}. Audience: Filipino customers/students on mobile. Features: home, list, detail, contact/order form, admin list. Style: Apple liquid-glass, SF font, SVG icons. Budget: tipid (₱0 start with Vercel + Convex + Cloudflare). Please scaffold pages + data model.`;
}
