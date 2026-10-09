# Submission — DreamBuild

Project: DreamBuild — local-AI dream-to-app builder
Team: Build Your Dream Apps (solo)
Repo: app-builder (public by 10AM Oct 10)
Hardware: Windows 11 laptop, Node 22, Chrome

## Proof
- Demo video ~1min: WiFi off → type dream → local plan → Approve template.apply + npm install → folder runs → stack cards + Namecheap/Cloudflare guide.
- Screenshots: wizard 3 steps, ApproveButtons, logs, offline badge.
- Post on X/LinkedIn tagging Devin/Cognition + #AppBuildersPH.

## What runs locally
Ollama LLM plan, nomic-embed RAG, template engine, sidecar writes, prompt coach, stack rules.

## What requires internet
npm install, convex sync, Vercel deploy, Namecheap buy. Documented as post-build deploy.

## Disclosures
Models: qwen2.5-coder:7b-instruct, nomic-embed-text. Tech: Next.js 16, Tailwind 4, Ollama, JSZip, Convex optional. No cloud AI API in core path. Existing assets: glass theme pattern + domain knowledge from author's rf-frozen-system / knowledge-center / villa-kathreyna. AI tools: opencode.

## Why local?
Privacy (menus, pupil data stay on device), ₱0 per-token, offline/brownout builds, instant local latency, hardware utilization. Remove local = no product.
