# Portfolio Chatbot Project

## Overview
This is Lucky Bajaj's personal portfolio site (static HTML on Vercel) with an AI chatbot that answers visitor questions about Lucky's experience, projects, and skills. The chatbot itself is a portfolio piece — it demonstrates product thinking and technical execution.

## Architecture
- Frontend: Static HTML (`index.html`) with a floating chat widget injected via vanilla JS
- Backend: Supabase Edge Function (`/functions/v1/chat`) that pxies requests to Groq API (Llama 3.3 70B)
- Context: `lucky-context.md` contains all knowledge about Lucky — loaded into the system prompt
- The Groq API key is stored as a Supabase secret, never exposed to the client

## Tech Stack
- Frontend: Vanilla HTML/CSS/JS (no framework)
- Backend: Supabase Edge Functions (Deno runtime)
- LLM: Groq API with Llama 3.3 70B model (`llama-3.3-70b-versatile`)
- Deployment: Vercel (frontend), Supabase (backend Edge Function)

## Key Files
- `index.html` — Main portfolio page + chat widget
- `supabase/functions/chat/index.ts` — Edge Function handling POST requests to Groq
- `lucky-context.md` — Chatbot knowledge base (Lucky's full professional context)
- `.env` — Local environment variables — gitignored

## Rules
- Never expose the Groq API key to the frontend
- The chat widget should be minimal, clean, and match the portfolio's aesthetic (DM Sans font, muted earth tones, clean lines)
- System prompt personality: Lucky's AI assistant, speaks in third person, wassional, redirects off-topic questions with personality
- All LLM calls go through the Supabase Edge Function, never directly from the browser
- Keep the portfolio as static HTML — no framework migration
- Add basic rate limiting in the edge function (simple in-memory counter per IP)
- Include a visible "Powered by AI" disclaimer in the chat widget
