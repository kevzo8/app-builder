# DreamBuild — Build Your Dream Apps, Offline

Team **Build Your Dream Apps** — App Builders PH Hackathon 2026, theme Local AI.

Non-technical SMBs, teachers, clinics, creators type a dream in plain words, get an honest stack recommendation (Vercel/Netlify/Cloudflare Pages/AWS, Convex/Supabase/Firebase/AWS-serverless, Namecheap/Cloudflare DNS), then approve an opencode-style agent that scaffolds real files **locally**.

## Quick start (judges)

```bash
cd app-builder
npm install
# Terminal 1 — local agent sidecar (file writes + allowlisted installs)
node local-builder/server.mjs
# Terminal 2 — UI
npm run dev
# open http://localhost:3000
```

Optional local LLM (recommended, still offline after pull):
```bash
# install Ollama from ollama.com, then:
ollama pull qwen2.5-coder:7b-instruct
ollama pull nomic-embed-text
```
Without Ollama the app still works via scripted fallback plan + hash-embed RAG fallback.

## What runs locally vs internet

Local: LLM planning, embeddings + RAG over templates/uploads, template apply, file writes, prompt coach, stack recommender.
Internet only: `npm install`, `npx convex dev`, Vercel/Netlify deploy, Namecheap purchase. Core builder works offline.

## Hardware tested

Windows 11, Node 22.16.0, Chrome (File System Access + export ZIP fallback).

## Models / tech disclosure

Models: `qwen2.5-coder:7b-instruct-q4_K_M` + `nomic-embed-text` via Ollama; fallback deterministic hash vectors + scripted planner (no cloud).
Frameworks: Next.js 16, React 19, Tailwind 4, lucide-react SVG, jszip, Convex (optional secondary sync only).
Sidecar: Node `local-builder/server.mjs`, allowlist: `npm install`, `npm run dev`, `ollama pull/list`, `npx convex dev --once`, `git init`. All steps require Approve click, 120s timeout.
Templates: `templates/sell|teach|serve|showcase` built during hackathon from author's RF/knowledge/Villa patterns.
AI dev tools: opencode + Devin-style agent loop (custom JSON planner inspired by opencode).
