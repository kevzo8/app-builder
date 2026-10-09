"use client";
import { useEffect, useMemo, useState } from "react";
import ThemeToggle from "../components/ThemeToggle";
import { STACKS, recommendStack, GLOSSARY, type Archetype, type Budget } from "../lib/stacks";
import { classifyArchetype, improvePrompt } from "../lib/rag";
import { Sparkles, Store, GraduationCap, CalendarCheck, Camera, Presentation, Heart, Cpu, WifiOff, Wifi, FolderDown, Play, Check, Info, Globe, Database, LayoutTemplate, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

const ARCH: { id: Archetype; label: string; icon: any; hint: string }[] = [
  { id: "sell", label: "Sell", icon: Store, hint: "Store / ordering like RF Frozen" },
  { id: "teach", label: "Teach", icon: GraduationCap, hint: "School / training like Knowledge Center" },
  { id: "serve", label: "Serve", icon: CalendarCheck, hint: "Booking like Villa Kathreyna" },
  { id: "showcase", label: "Showcase", icon: Camera, hint: "Photo portfolio / menu site" },
  { id: "present", label: "Present", icon: Presentation, hint: "Slide decks as web apps" },
  { id: "evite", label: "E-vite", icon: Heart, hint: "Wedding / birthday invites + RSVP" },
];

export default function DreamBuild() {
  const [dream, setDream] = useState("");
  const [budget, setBudget] = useState<Budget>("tipid");
  const [context, setContext] = useState("");
  const [name, setName] = useState("my-dream-app");
  const [step, setStep] = useState(1);
  const [ollama, setOllama] = useState<{ online: boolean; models: string[] }>({ online: false, models: [] });
  const [online, setOnline] = useState(true);
  const [plan, setPlan] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [rag, setRag] = useState<any[]>([]);

  const archetype = useMemo<Archetype>(() => classifyArchetype(dream || name), [dream, name]);
  const rec = useMemo(() => recommendStack(archetype, budget), [archetype, budget]);

  useEffect(() => {
    setOnline(navigator.onLine);
    const f = () => setOnline(navigator.onLine);
    window.addEventListener("online", f); window.addEventListener("offline", f);
    fetch("/api/local/chat").then((r) => r.json()).then(setOllama).catch(() => {});
    return () => { window.removeEventListener("online", f); window.removeEventListener("offline", f); };
  }, []);

  async function doRag() {
    const r = await fetch("/api/local/rag", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: dream, extra: context }) }).then((x) => x.json());
    setRag(r.hits ?? []);
  }

  async function genPlan() {
    setBusy(true); setLogs((l) => [...l, "Asking local AI for plan..."]);
    const r = await fetch("/api/local/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dream, archetype, projectName: name, history: logs }) }).then((x) => x.json());
    setPlan(r.plan); setLogs((l) => [...l, r.fallback ? "Local model unreachable — scripted fallback plan ready." : `Plan from ${r.model} (local). Review then Approve.`]);
    setBusy(false);
  }

  async function runStep(s: any) {
    setLogs((l) => [...l, `> ${s.label}`]);
    try {
      let url = "";
      let body: any = {};
      if (s.tool === "template.apply") { url = "http://127.0.0.1:3001/tool/template.apply"; body = s.args; }
      else if (s.tool === "fs.write") { url = "http://127.0.0.1:3001/tool/fs.write"; body = { cwd: name, ...s.args }; }
      else if (s.tool === "shell.exec" || s.tool === "project.install" || s.tool === "project.preview") {
        const cmd = s.args.cmd ?? (s.tool === "project.install" ? "npm install" : "npm run dev");
        url = "http://127.0.0.1:3001/tool/shell.exec"; body = { cmd, cwd: s.args.cwd ?? name };
      }
      if (!url) return;
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((x) => x.json());
      setLogs((l) => [...l, (r.log ?? r.stdout ?? JSON.stringify(r)).slice(0, 800)]);
    } catch {
      setLogs((l) => [...l, "Sidecar not running. Start: node local-builder/server.mjs — or use Export ZIP below."]);
    }
  }

  async function exportZip() {
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();
    zip.file("README.md", `# ${name}\n\nDream: ${dream}\nArchetype: ${archetype}\n\nDeploy:\n1. Push to GitHub\n2. Vercel → Import → Deploy\n3. Domain: Namecheap → Cloudflare NS → Vercel Add Domain\n4. Backend: npx convex dev\n`);
    zip.file("dream.json", JSON.stringify({ dream, archetype, budget, rec, context }, null, 2));
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `${name}.zip`; a.click();
    setLogs((l) => [...l, "Exported ZIP (browser fallback, no sidecar needed)."]);
  }

  return (
    <div className="min-h-screen font-body text-slate-800 dark:text-slate-100">
      <header className="glass sticky top-0 z-20 border-b border-white/50 dark:border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-3 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg"><Sparkles size={22} /></span>
          <div className="leading-tight">
            <p className="font-display text-lg font-bold tracking-tight">DreamBuild</p>
            <p className="text-[11px] uppercase tracking-[0.25em] opacity-60">Build Your Dream Apps • Local AI</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${ollama.online ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/15 text-amber-700 dark:text-amber-300"}`}>
              <Cpu size={14} /> {ollama.online ? `Local: ${ollama.models[0] ?? "Ollama"}` : "Local fallback"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs font-bold">
              {online ? <><Wifi size={14} /> Online</> : <><WifiOff size={14} /> Offline — still builds</>}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-16 pt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          {/* Steps */}
          <div className="glass rounded-3xl p-5 flex gap-2">
            {[1, 2, 3].map((s) => (
              <button key={s} onClick={() => setStep(s)} className={`flex-1 rounded-2xl px-3 py-2.5 text-sm font-bold transition ${step === s ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "hover:bg-black/5 dark:hover:bg-white/10"}`}>
                {s} • {s === 1 ? "Dream" : s === 2 ? "Stack" : "Build"}
              </button>
            ))}
          </div>

          {step === 1 && (
            <section className="glass-strong rounded-3xl p-6 anim-fade-up">
              <h1 className="font-display text-3xl font-bold tracking-tight">What is your dream app?</h1>
              <p className="mt-1 text-sm opacity-70">Type like you talk — literally anything: shop, class, booking, portfolio, slides, invite. No code needed.</p>
              <textarea value={dream} onChange={(e) => setDream(e.target.value)} rows={4} placeholder="I want an app for my sari-sari store to take orders..." className="mt-3 min-h-[110px] w-full rounded-2xl border border-slate-200 dark:border-white/10 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ARCH.map((a) => (
                  <div key={a.id} className={`rounded-2xl border p-3 text-sm ${archetype === a.id ? "border-blue-500 bg-blue-500/10" : "border-slate-200 dark:border-white/10"}`}>
                    <a.icon size={18} /><p className="mt-1 font-bold">{a.label} {archetype === a.id && <span className="text-blue-600">• auto</span>}</p><p className="text-xs opacity-60">{a.hint}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => setDream(improvePrompt(dream || "my store"))} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-slate-900 min-h-[44px]">Improve my prompt (local)</button>
                <button onClick={doRag} className="rounded-full glass px-4 py-2 text-sm font-bold min-h-[44px]">Find matching template (local RAG)</button>
                <select value={budget} onChange={(e) => setBudget(e.target.value as Budget)} className="rounded-full glass px-4 py-2 text-sm font-bold min-h-[44px]" aria-label="Budget">
                  <option value="tipid">Tipid ₱0 start</option><option value="standard">Standard</option><option value="scale">Scale later</option>
                </select>
              </div>
              <label className="mt-4 block text-sm font-bold">Your context — paste menu, price list, syllabus <span className="font-normal opacity-60">(stays on device)</span>
                <textarea value={context} onChange={(e) => setContext(e.target.value)} rows={3} placeholder="Belly Biso ₱245/kg, CLQ ₱151... or Day 1-20 topics..." className="mt-1 w-full rounded-2xl border border-slate-200 dark:border-white/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </label>
              {rag.length > 0 && <ul className="mt-3 space-y-1.5 text-sm">{rag.map((h: any) => <li key={h.id} className="rounded-xl bg-black/5 dark:bg-white/10 px-3 py-2"><b>{h.source}</b> — {h.text.slice(0, 140)}...</li>)}</ul>}
              <button onClick={() => setStep(2)} className="mt-4 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 font-bold text-white min-h-[52px]">Continue to Stack</button>
            </section>
          )}

          {step === 2 && (
            <section className="glass-strong rounded-3xl p-6 anim-fade-up">
              <h2 className="font-display text-2xl font-bold flex items-center gap-2"><LayoutTemplate size={22} /> Your stack — ₱0 to start</h2>
              <p className="mt-1 text-sm opacity-70">{rec.why}</p>
              <div className="mt-3 grid gap-2">
                {(["frontend", "backend", "dns", "domain", "repo"] as const).map((layer) => {
                  const opts = STACKS.filter((s) => s.layer === layer);
                  const picked = (rec as any)[layer] ?? opts.find((o) => o.recommended)?.id;
                  return (
                    <details key={layer} open={layer === "frontend"} className="rounded-2xl border border-slate-200 dark:border-white/10 p-3">
                      <summary className="cursor-pointer font-bold capitalize flex items-center gap-2 min-h-[44px]"><Globe size={16} /> {layer} — {opts.find((o) => o.id === picked)?.name}</summary>
                      <div className="mt-2 space-y-2">
                        {opts.map((o) => (
                          <div key={o.id} className={`rounded-xl p-3 text-sm ${o.id === picked ? "bg-blue-500/10 border border-blue-500/40" : "bg-black/5 dark:bg-white/5"}`}>
                            <p className="font-bold">{o.name} {o.tag && <span className="ml-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-300">{o.tag}</span>} <span className="font-normal opacity-60">• {o.cost} • {o.freeLimit} • difficulty {o.difficulty}/5</span></p>
                            <p className="mt-1 opacity-80">Good: {o.pros.join("; ")}. Watch: {o.cons.join("; ")}</p>
                            <p className="mt-1 text-blue-700 dark:text-blue-300">{o.whenToPick}</p>
                          </div>
                        ))}
                      </div>
                    </details>
                  );
                })}
              </div>
              <div className="mt-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3 text-sm">
                <p className="font-bold flex items-center gap-1.5"><Database size={15} /> Domain in 3 steps (Namecheap you use)</p>
                <p className="mt-1">1. Buy .com on Namecheap ~₱600/yr 2. Cloudflare → Add site → change NS 3. Vercel → Add Domain → Done + free SSL. App works on localhost/Vercel link even with no domain.</p>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setStep(1)} className="rounded-2xl glass px-5 py-3 font-bold min-h-[52px]">Back</button>
                <button onClick={() => setStep(3)} className="flex-1 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 font-bold text-white min-h-[52px]">Continue to Build</button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="glass-strong rounded-3xl p-6 anim-fade-up">
              <h2 className="font-display text-2xl font-bold flex items-center gap-2"><Play size={22} /> Build — approve like opencode</h2>
              <div className="mt-3 flex gap-2">
                <input value={name} onChange={(e) => setName(e.target.value.replace(/[^a-z0-9-]/gi, "").toLowerCase())} className="flex-1 rounded-2xl border border-slate-200 dark:border-white/10 px-4 py-2.5 font-mono text-sm outline-none" aria-label="Project folder name" />
                <button onClick={genPlan} disabled={busy} className="rounded-2xl bg-slate-900 px-5 py-2.5 font-bold text-white dark:bg-white dark:text-slate-900 min-h-[48px]">{busy ? "..." : "Generate plan"}</button>
              </div>
              {plan && (
                <div className="mt-3 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-3 text-sm">
                  <p className="opacity-80 italic">{plan.thought}</p>
                  <div className="mt-2 space-y-1.5">
                    {plan.steps.map((s: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 rounded-xl bg-white/70 dark:bg-black/30 px-3 py-2">
                        <span className="flex-1 font-mono text-xs">{s.tool} — {s.label}</span>
                        <button onClick={() => runStep(s)} className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white min-h-[40px]"><Check size={13} /> Approve</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-3 rounded-2xl bg-black text-emerald-300 p-3 font-mono text-xs max-h-56 overflow-auto" aria-live="polite">
                {logs.length === 0 ? "Logs appear here. Sidecar: node local-builder/server.mjs" : logs.map((l, i) => <p key={i}>&gt; {l}</p>)}
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={exportZip} className="rounded-2xl glass px-5 py-3 font-bold min-h-[52px] flex items-center gap-1.5"><FolderDown size={17} /> Export ZIP</button>
                <div className="flex-1 rounded-2xl bg-black/5 dark:bg-white/10 p-3 text-xs">Deploy: push folder to GitHub → Vercel Import → <span className="font-mono">npx convex dev --once</span> → add Namecheap domain via Cloudflare.</div>
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-5 h-fit lg:sticky lg:top-20">
          <div className="glass rounded-3xl p-5">
            <p className="font-bold flex items-center gap-1.5"><BookOpen size={17} /> How apps work — 30 seconds</p>
            <ol className="mt-2 text-sm space-y-1.5 opacity-90">
              <li><b>1. What visitors see</b> — design + gallery/menu. Vercel puts it online free.</li>
              <li><b>2. Where data saves</b> — orders/bookings. Convex/Supabase = online Excel.</li>
              <li><b>3. Your .com address</b> — Namecheap buys, Cloudflare directs, Vercel serves.</li>
            </ol>
            <p className="mt-2 text-xs opacity-60">You just prompted → local AI planned → you approve → real files. That is app development.</p>
          </div>
          <div className="glass rounded-3xl p-5">
            <p className="font-bold flex items-center gap-1.5"><Info size={16} /> Words to know</p>
            <dl className="mt-2 text-sm space-y-1">{Object.entries(GLOSSARY).map(([k, v]) => <div key={k}><dt className="font-bold">{k}</dt><dd className="opacity-70">{v}</dd></div>)}</dl>
          </div>
          <div className="glass rounded-3xl p-5 text-sm">
            <p className="font-bold">What runs locally vs internet</p>
            <p className="mt-1"><b className="text-emerald-600">Local:</b> LLM plan, embeddings/RAG, templates, file writes.</p>
            <p><b className="text-amber-600">Internet only:</b> npm install, Convex sync, Vercel deploy, Namecheap buy.</p>
          </div>
        </aside>
      </main>
      <footer className="border-t border-white/40 dark:border-white/10 py-6 text-center text-xs tracking-[0.2em] opacity-60">DREAMBUILD • TEAM BUILD YOUR DREAM APPS • LOCAL AI FIRST</footer>
    </div>
  );
}
