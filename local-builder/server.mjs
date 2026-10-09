// DreamBuild local-builder sidecar — opencode-style agency, allowlisted only.
// Run: node local-builder/server.mjs  (listens 127.0.0.1:3001)
// UI calls it after user hits Approve. Never auto-runs.
import http from "http";
import { execFile } from "child_process";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "dream");
await fs.mkdir(OUT, { recursive: true });

const ALLOW_SHELL = [
  /^npm install$/,
  /^npm run dev(-- --port \d+)?$/,
  /^ollama (pull|list)( [\w:.-]+)?$/,
  /^npx convex dev --once$/,
  /^git init$/,
  /^dir$/,
  /^npm run build$/,
];

function allowed(cmd) { return ALLOW_SHELL.some((re) => re.test(cmd.trim())); }
function safeJoin(base, p) {
  const r = path.resolve(base, p);
  if (!r.startsWith(base)) throw new Error("path escape blocked");
  return r;
}

async function copyDir(src, dst) {
  await fs.mkdir(dst, { recursive: true });
  const ents = await fs.readdir(src, { withFileTypes: true });
  for (const e of ents) {
    if (e.name === "node_modules" || e.name === ".next") continue;
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) await copyDir(s, d);
    else await fs.copyFile(s, d);
  }
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }
  if (req.method === "GET" && req.url === "/health") { res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify({ ok: true, out: OUT })); return; }
  if (req.method !== "POST") { res.writeHead(404); res.end(); return; }
  let body = "";
  for await (const c of req) body += c;
  let j = {};
  try { j = JSON.parse(body || "{}"); } catch {}
  try {
    if (req.url === "/tool/template.apply") {
      const { archetype, name } = j;
      const safe = String(name || "my-app").replace(/[^a-z0-9-_]/gi, "").slice(0, 40) || "my-app";
      const src = path.join(ROOT, "templates", archetype);
      const dst = path.join(OUT, safe);
      await copyDir(src, dst);
      // stamp project name
      try {
        const pkg = path.join(dst, "package.json");
        const t = JSON.parse(await fs.readFile(pkg, "utf8"));
        t.name = safe;
        await fs.writeFile(pkg, JSON.stringify(t, null, 2));
      } catch {}
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, dst, log: `Applied ${archetype} → ${dst}` }));
      return;
    }
    if (req.url === "/tool/fs.write") {
      const { cwd, file, content } = j;
      const base = safeJoin(OUT, String(cwd || "my-app"));
      const dst = safeJoin(base, String(file));
      await fs.mkdir(path.dirname(dst), { recursive: true });
      await fs.writeFile(dst, String(content ?? ""));
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, dst }));
      return;
    }
    if (req.url === "/tool/shell.exec") {
      const { cmd, cwd } = j;
      if (!allowed(String(cmd))) { res.writeHead(403, { "Content-Type": "application/json" }); res.end(JSON.stringify({ ok: false, error: "Command not allowlisted. Ask for npm install / npm run dev / ollama pull only." })); return; }
      const base = safeJoin(OUT, String(cwd || "."));
      const isWin = process.platform === "win32";
      const [bin, ...args] = String(cmd).split(" ");
      execFile(isWin ? "cmd.exe" : bin, isWin ? ["/c", String(cmd)] : args, { cwd: base, timeout: 120000, shell: false }, (err, stdout, stderr) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: !err, code: err?.code ?? 0, stdout: String(stdout).slice(-4000), stderr: String(stderr).slice(-2000) }));
      });
      return;
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: "unknown tool" }));
  } catch (e) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: String(e.message || e) }));
  }
});

server.listen(3001, "127.0.0.1", () => console.log("DreamBuild sidecar → http://127.0.0.1:3001 health OK, out=" + OUT));
