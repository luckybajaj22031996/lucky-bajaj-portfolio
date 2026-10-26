# Portfolio Chatbot Project

## Overview
This is Lucky Bajaj's personal portfolio site (static HTML on Vercel) with an AI chatbot that answers visitor questions about Lucky's experience, projects, and skills. The chatbot itself is a portfolio piece — it demonstrates product thinking and technical execution.

## Architecture
- Frontend: Static HTML (`index.html`) with a floating chat widget (vanilla JS)
- Backend: Vercel serverless function (`api/chat.js`, Node runtime) that proxies requests to the Groq API
- Context: `lucky-context.md` contains all knowledge about Lucky — mirrored into the system prompt in `api/chat.js`
- The Groq API key lives in Vercel environment variables (`GROQ_API_KEY`) — never exposed to the client, never committed
- Chat requests go to same-origin `/api/chat` (no CORS, no client-side auth tokens)

## Tech Stack
- Frontend: Vanilla HTML/CSS/JS (no framework) — GSAP + ScrollTrigger + Lenis for motion, deployed on Vercel
- Backend: Vercel serverless function (Node 20+)
- LLM: Groq API with GPT-OSS 120B model (`openai/gpt-oss-120b`) — Llama 4 Scout was retired by Groq on 2026-07-17
- Deployment: Vercel only (frontend + backend deploy together on every push)

## History (why Vercel)
The chatbot backend originally ran as a Supabase Edge Function. Supabase's free tier pauses "inactive" projects (its activity metric counts Postgres queries only — edge-function traffic doesn't count), which took the chatbot down twice (late July 2026 and Oct 24 2026) despite a GitHub Actions keep-alive. The backend was ported to a Vercel serverless function in Oct 2026 — Vercel functions never pause for inactivity. The old Deno function and keep-alive workflow live in git history (see commit history before the port) if ever needed.

## Key Files
- `index.html` — Main portfolio page + chat widget
- `api/chat.js` — Vercel serverless function handling POST requests to Groq
- `lucky-context.md` — Chatbot knowledge base (Lucky's full professional context)
- `.env` — Local environment variables — gitignored

## Rules
- Never expose the Groq API key to the frontend or commit it to the repo
- The chat widget should be minimal, clean, and match the portfolio's aesthetic (DM Serif Display + DM Sans, warm earth tones)
- System prompt personality: Lucky's AI assistant, speaks in third person, witty Jarvis-style, redirects off-topic questions with charm
- All LLM calls go through `api/chat.js`, never directly from the browser
- Keep the portfolio as static HTML — no framework migration
- Rate limiting stays in `api/chat.js` (best-effort in-memory counter per IP)
- Include a visible "Powered by AI" disclaimer in the chat widget
- After changing `GROQ_API_KEY` in Vercel env vars, a new deployment is required for it to take effect
