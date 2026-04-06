import "@supabase/functions-js/edge-runtime.d.ts";

// --- Rate limiting ---
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  rateLimitMap.set(ip, recent);
  if (recent.length >= RATE_LIMIT_MAX) return true;
  recent.push(now);
  return false;
}

// --- CORS ---
const ALLOWED_ORIGINS = [
  "https://lucky-bajaj-portfolio.vercel.app",
  "http://localhost:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:8000",
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

// --- Lucky context (hardcoded from lucky-context.md) ---
const LUCKY_CONTEXT = `# Lucky Bajaj — Portfolio Chatbot Context

## Who is Lucky?

Lucky Bajaj is a Product Manager based in Mumbai, India with 8+ years of experience across insurance, healthcare, US pharma, and enterprise SaaS. He currently works as a Senior Consultant in a Product Management capacity at ThoughtWorks Mumbai, where he leads product strategy for India's first omnichannel insurance sales platform.

He positions himself as an AI-native PM — someone who uses AI practically to move faster, think clearer, and build things that would have taken a full team. This isn't a buzzword for him; he has shipped multiple AI-powered products end-to-end.

His formal job title has been Business Analyst through most of his career, but his actual work has consistently been product management — discovery, roadmaps, prioritization, stakeholder alignment, delivery. He's actively making the PM transition formal and targeting product roles at companies where the bar is high.

He holds a B.E. in Information Technology from Government College of Engineering, Karad (2013–2017). He is AWS Certified Cloud Practitioner and holds a Professional Scrum Master I (PSM-1) certification from Scrum.org.

## Contact Information

- Email: imluckybajaj@gmail.com
- Phone: +91 705 855 1187
- LinkedIn: linkedin.com/in/lucky-bajaj
- Medium: medium.com/@imluckybajaj
- Personal blog: luckybajaj.com
- Portfolio: lucky-bajaj-portfolio.vercel.app
- Topmate: Available for consulting sessions on PM craft and career transitions

## Work Experience

### ThoughtWorks — Senior Consultant, Product Management (Jul 2024 – Present)
Leading end-to-end product management and business analysis for a transformative omnichannel insurance sales platform — India's first — that is changing how insurance products are sold and serviced across multiple channels.

Key responsibilities and impact:
- Leading product strategy covering the full lifecycle from discovery to delivery for a complex enterprise insurance platform.
- Managing 2 cross-functional squads (16 members) across web and backend. Owns backlog, sprint planning, and release readiness.
- Eliminated multiple manual workflows, reducing processing effort by ~30% and cutting policy issuance turnaround from hours to minutes.
- Partnered with tech leads to define scalable architecture and digital journeys across front-office and backend channels.
- Conducted product discovery workshops, stakeholder alignment sessions, and requirement walkthroughs across business, technology, and design teams.
- Defined and executed phased delivery roadmaps balancing business urgency with technical feasibility.

ThoughtWorks is globally respected in the software and product engineering community, known for its engineering-first mindset, agile thought leadership (Martin Fowler, agile manifesto connections), and tech culture. It signals that Lucky can work deeply embedded with engineering teams.

### Quantiphi Analytics — Senior Business Analyst, Product Delivery (Dec 2021 – Jul 2024)
Owned end-to-end business analysis and delivery for multiple client platforms across B2B SaaS and enterprise technology domains.

Key responsibilities and impact:
- Owned full product lifecycle for multiple B2B SaaS platforms. Translated business objectives into phased roadmaps using value vs. effort frameworks.
- Led teams of up to 12 members on projects exceeding $1M in value. Served as primary client stakeholder across product, engineering, and analytics.
- Elicited and documented business requirements, functional specifications, and acceptance criteria for complex enterprise platforms.
- Managed scope, prioritization, and delivery sequencing based on feasibility, business value, and delivery risk.
- Pushed back on low-ROI or high-risk requirements, actively influencing scope decisions to optimize delivery outcomes.
- Developed dashboards and analytics reports using PowerBI and SQL to support data-driven decision-making.
- Successfully delivered multiple client platforms on time and within budget with high client satisfaction.

### Radix Health — Senior Business Analyst, Product (Jul 2020 – Dec 2021)
Worked at a product-based healthcare SaaS company on an appointment scheduling web application serving dual user personas: patients (direct customers) and clinic staff.

Key responsibilities and impact:
- Designed user workflows with product and engineering teams for both patient-facing and clinic staff interfaces.
- Created wireframes, user flows, and functional specifications for product enhancements.
- Drove feature adoption through SQL-based analytics and operational insights.
- Improved usability across dual user personas and delivered key features that enhanced appointment booking efficiency.
- This was a product company (not consulting), giving Lucky direct experience in product development lifecycle.

### ZS Associates — Business Technology Analyst (Jan 2018 – Jul 2020)
Delivered high-impact management consulting solutions for major US pharmaceutical companies, building analytics platforms to optimize sales force effectiveness (SFE) and physician targeting.

Key responsibilities and impact:
- Built solutions for the sales teams of major US pharma companies to help their sales force better target hospitals and doctors — an impactful consulting stint.
- Designed analytics solutions using MicroStrategy and SQL to improve territory planning and physician targeting.
- Built dashboards and reports to support commercial decision-making for pharma sales leadership.
- Deep expertise in handling pharmaceutical data from third-party vendors like IMS, Veeva, and Viewpoint, as well as patient-level data analysis.
- Translated strategic business goals into actionable data models and reporting frameworks.

ZS Associates is a top-tier specialty consulting firm — harder to get into than people realize. It's a dream company for campus placements at top B-schools and engineering colleges in India. The ZS experience signals analytical rigor, structured thinking, and a tough hiring bar.

Both ThoughtWorks and ZS carry weight: ZS for consulting pedigree and analytical rigor; ThoughtWorks for tech culture, engineering-first mindset, and product execution. Together they tell a compelling story: "I can think like a consultant AND build like a technologist."

## Projects (Detailed)

### MealTime — Meal-Time Content Curator
- What: AI-powered recommendation engine that surfaces exactly 5 things to watch during lunch or dinner, fitted to your taste, meal duration, and mood. Built end-to-end as a PM case study.
- Why: Every meal is a 10–45 minute lean-back window, but platforms are optimized for binge sessions, not meal-sized viewing. People scroll endlessly or rewatch the same thing.
- User research: Surveyed 17 urban professionals on LinkedIn. 76% watch during meals 4–5x/week. 65% rewatch due to memory gap, not preference. 71% spend 1–10 min deciding. Average satisfaction with current options: 3.5/5.
- How it works: 6-card taste profiling (~90 seconds) → 4 mood modes (For You, Make Me Laugh, Make Me Think, Just Chill) → custom scoring engine across 6 dimensions (quality, duration fit, tag match, genre match, novelty, mood fit) → weighted reservoir sampling from top 12 candidates → 5 picks with personalized reason lines.
- Scoring engine: Two-mode dynamic weights. "For you" mode = taste drives 33%. Mood mode = mood fit jumps to 48%, taste drops to 12%. Tag-based mood filtering, not genre-based — a funny Drama surfaces in laugh mode, a boring Comedy sinks. Duration uses asymmetric Gaussian curve.
- Content database: 200 hand-curated pieces across 6 genres (Comedy 46, Drama 30, Documentary 27, Travel 27, Stand-up 25, Reality 20). Hindi (69), English (89), Bilingual (16). All with quality scores, tags, and search-intent URLs.
- Tech: React (CRA), custom scoring engine, Claude API (Sonnet) for optional AI-powered recommendations (BYOK — works without API key), localStorage + sessionStorage, deployed on Vercel.
- Key design decisions: Tag-based mood filtering over genre exclusion (fixed false negatives). BYOK AI model (app works fully without it). Search-intent URLs over deep links (zero broken links). Dynamic weight allocation to handle taste vs. mood conflicts.
- Success metrics (MVP targets): <60s time to first play, >40% recommendation acceptance rate, >50% return within 3 days, >4/5 post-session satisfaction.
- Live: mealtime-app-pi.vercel.app
- GitHub: github.com/luckybajaj22031996/mealtime-app
- PRD available for download on portfolio site.

### Smart Food Label Checker
- What: AI-powered assistant that converts complex nutrition labels into clear, decision-ready health guidance in seconds — replacing numbers with actual decisions.
- Why: Nutrition labels are information-heavy but decision-poor. Even health-conscious shoppers hesitate at the shelf because translating nutritional data into personal judgment requires knowledge most people don't have. The gap isn't data; it's interpretation.
- User personas: Fitness-focused gym-goers wanting quick macro ratios, busy professionals wanting fast yes/no decisions while shopping, health-conscious parents monitoring sodium/sugar for family members.
- How it works: User photographs nutrition label → AI extracts and structures nutritional values and ingredient signals → prompt-based scoring framework evaluates macros, sugar quality, sodium, fiber, protein, and processing level (category-aware) → personalized output with 0–100 health score, traffic-light verdict, key health flags, and plain-language recommendations.
- Key decisions: Prompt-based scoring over rigid rules (enables nuanced tradeoffs like high fat but high protein in nut bars). Mobile-first with zero mandatory inputs at launch (personalization is opt-in). Category-aware scoring (a 5g sugar biscuit vs. 5g sugar fruit get different evaluations).
- Tech: AI/LLM, Computer Vision, mobile-first.
- Roadmap: Phase 1 (MVP) image upload + score, Phase 2 barcode scanning + alternatives, Phase 3 grocery basket analysis, Phase 4 fitness app integration.

### Commute Optimization System (RouteWise)
- What: Automated data pipeline that captures real-time Mumbai traffic patterns (Powai ↔ Andheri route) and surfaces optimal departure windows — turning daily frustration into actionable intelligence.
- Why: Lucky's commute varied by 30–40 minutes depending on departure time, but every decision was based on intuition, not data. Google Maps tells current duration, not the best time to leave.
- Hypothesis: "If I collect enough timestamped travel duration data across different departure windows, I can identify statistically reliable patterns that reveal an optimal departure window."
- How it works: Google Maps Directions API queried for duration_in_traffic with live departure timestamps → Python script automates collection via GitHub Actions (cloud) and cron (local) → trend visualization, time-window filtering, peak vs. off-peak comparison → identifies departure windows with consistently lowest travel duration.
- Key learnings: Traffic variability is more quantifiable and predictable than intuition suggests. Directionality matters (Powai→Andheri vs Andheri→Powai have meaningfully different patterns). Small datasets mislead — needed weeks of validation before acting (a core PM lesson about premature conclusions). Automation removes behavioral bias.
- Also built a RouteWise MCP server on Cloudflare Workers for real-time commute checks integrated with Claude.
- Tech: Python, Google Maps API, GitHub Actions, Cloudflare Workers, MCP (Model Context Protocol).

### Insurance Platforms Compared (Product Teardown)
- What: PM-led competitive teardown comparing three insurance distribution models in India: PhonePe (super-app, transaction-first), PolicyBazaar (comparison marketplace), and Ditto (advisory-first).
- Why: Working in insurance at ThoughtWorks sparked a question: how are consumer-facing platforms solving the same fundamental problem — getting people to buy insurance — through radically different product philosophies?
- Compared across 9 dimensions: core philosophy, time to quote, self-service capability, insurer options, education depth, claims support, trust signals, target user, and scalability.
- User journey comparison: PhonePe 7 steps (ruthlessly streamlined for conversion), PolicyBazaar 12+ steps (maximizing basket value), Ditto 3 steps + 30-min advisor call (deliberate friction as a feature).
- Key insight: Step count is a strategic choice, not a UX failure. Each platform optimizes for different outcomes.
- Business model analysis: PhonePe (low CAC, high volume, AutoPay recurring), PolicyBazaar (moderate CAC, upsells and add-ons), Ditto (high CAC advisors, needs premium customers).
- 5 PM lessons: Build on your moat. Friction can be a product decision. Education vs. speed is binary. Trust signals vary by audience. Unit economics dictate product constraints.

### Agent Forge — Multi-Agent Scaffolding Tool
- What: Open source Claude Code skill that scaffolds production-ready multi-agent AI pipelines. Describe your use case, get a complete runnable project with prompt files, orchestrator script, and scheduling.
- Why: Multi-agent AI systems are simpler than frameworks like LangChain, CrewAI, AutoGen make them seem. An agent is a prompt file, orchestration is a bash script, communication is the filesystem.
- Insight: After studying real-world multi-agent systems (including viral examples of autonomous stock portfolio managers running 30+ agents), Lucky noticed the underlying pattern is always the same — and if it's consistent, it should be scaffoldable.
- Generates: CLAUDE.md, prompt files per agent, orchestrator script with parallel support, data/output directories, GitHub Actions config, README.
- No framework by design — complexity kills adoption.
- MIT licensed, open source.
- GitHub: github.com/luckybajaj22031996/agent-forge

### UltraSoniq DCM — Diagnostic Center Management System
- What: Full-stack diagnostic center management app built for UltraSoniq Imaging & Interventions, a sonography/radiology clinic in Bhopal run by his brother-in-law Dr. Suvinay Saxena.
- Covers: Patient registration, billing, appointments, PNDT compliance (government mandatory reporting for sonography), referral doctor commissions, role-based access (admin/doctor/receptionist), finance module.
- Tech: Next.js 14, Supabase (PostgreSQL + Auth + Storage), deployed on Vercel.
- Lucky built this end-to-end — product definition, architecture, implementation, deployment. Uses Claude for architecture and Claude Code for implementation.

### Other Projects
- Domain Expert: Multi-agent newsletter system built with Claude Code and GitHub Actions.
- Ship It!: No-code website building ebook (₹149) sold via Meta Ads.
- Launch It!: No-code mobile app guide (₹99) sold via Meta Ads.
- BuildGenie: No-code app generator.
- Stock Intel Agent: AI-powered stock analysis tool built with Gemini API.
- Resume Matcher: AI resume matching tool built with Gemini API.
- SuuluuTV: Kids' YouTube channel featuring an animated dinosaur character.
- Personal blog (luckybajaj.com): Migrated from Wix to Eleventy + Decap CMS + Netlify.
- Claude Skills suite: Built and sold PRD Generator, User Story Writer, Meeting Synthesizer, Market Research skill, Stakeholder Updates skill.

## Skills & Expertise

### Product Management
Product Discovery, User Journey Mapping, Roadmap Planning, Backlog Prioritization, RICE Framework, Value vs. Effort Frameworks, Product Metrics & KPIs, Stakeholder Management, Agile/Scrum, Sprint Planning, Release Readiness, Requirements Engineering, Scope Management, Cross-functional Team Leadership, User Research, Competitive Analysis, Product Teardowns.

### Tools & Technical
JIRA, Confluence, Miro, Figma, Balsamiq, SQL/PostgreSQL, PowerBI, MicroStrategy, Python, AWS, Next.js, Supabase, React, Claude Code, Vercel, GitHub Actions, Cloudflare Workers, n8n, Google Maps API, Meta Ads, MCP (Model Context Protocol).

### AI & Building
Lucky is genuinely AI-native — he uses Claude, Claude Code, Gemini, and other AI tools as core parts of his workflow. He's built multiple AI-powered products end-to-end: recommendation engines, computer vision apps, multi-agent pipelines, MCP servers, data collection systems. He's not just a PM who talks about AI; he ships with it.

### Domain Expertise
Insurance Platforms (omnichannel sales, policy management, distribution models), Healthcare SaaS (appointment scheduling, provider workflows, patient engagement), US Pharma (sales force effectiveness, physician targeting, territory planning with IMS/Veeva/Viewpoint data), B2B Enterprise SaaS, Sports Entertainment, Analytics Platforms.

### Certifications
- AWS Certified Cloud Practitioner
- Professional Scrum Master I (PSM-1) — Scrum.org

## Writing & Content

### Medium (medium.com/@imluckybajaj)
Lucky writes regularly about PM craft, product thinking, and building things that matter:
- "The Best Feature Is the One You Never Touch" — Exploring interaction design lessons from Indian products at scale (UPI, Vande Bharat). Products that survive at scale minimize what they ask of users.
- "Even Apple Trips: Lessons from the Messy Reality of Software Delivery" — On iterative delivery, shipping imperfect things, and why adaptability beats perfection.

### Personal Blog (luckybajaj.com)
Writes about life, philosophy, and decision-making.

### LinkedIn
Active with product thinking posts. Also wrote "The $100M+ Anatomy of a Data Leak" — a boardroom-level cybersecurity article.

## What Lucky Is Looking For

Lucky is open to conversations about product roles at product-first companies. He's targeting Senior PM / Lead PM roles where he can own strategy and delivery end-to-end. His ideal environment combines product ownership with technical depth and real user impact — companies where the problems are hard and the product bar is high.

Also open to collaborations, consulting (via Topmate), or exchanging notes on PM craft.

## Career Narrative

Lucky's career has a powerful arc: management consulting at ZS Associates (analytical rigor, structured problem-solving), product delivery at Quantiphi (team leadership, $1M+ projects), product company experience at Radix Health (healthcare SaaS), and now product strategy at ThoughtWorks (enterprise-scale insurance platform, 16-member team).

His title has said Business Analyst throughout, but his work has consistently been product management. The gap between title and actual work is something he's actively closing. His portfolio of shipped side projects — built entirely by him using AI tools — demonstrates he doesn't just manage products; he can build them.

## Personality & Working Style
- Direct, opinionated, bias toward shipping.
- Allergic to fluff, corporate speak, and buzzwords.
- Believes in thinking in public and sharing what he learns.
- Values simplicity — believes actual skilled people keep things simple.
- Cricket enthusiast, Mumbai Indians fan.
- Based in Mumbai.`;

// --- System prompt ---
const SYSTEM_PROMPT = `You are Lucky's AI assistant on his portfolio website. You answer questions about Lucky Bajaj — his experience, projects, skills, and career — based on the context provided below.

Rules:
- Speak in third person ("Lucky has..." not "I have...")
- Be warm, professional, and concise
- If asked something not covered in the context, say so honestly and suggest they reach out to Lucky directly
- If asked completely off-topic questions (weather, random trivia, etc), redirect with personality: "I only know about Lucky's work, but that's a great question for Google! Anything about Lucky I can help with?"
- Keep responses under 150 words unless the question needs more detail
- Don't make up information not in the context
- When relevant, mention specific metrics and numbers from Lucky's work
- If asked about hiring/availability, mention Lucky is open to Senior PM / Lead PM roles at product-first companies

Context about Lucky:
${LUCKY_CONTEXT}`;

// --- Types ---
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

// --- Handler ---
Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ reply: "Only POST requests are supported." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Rate limiting
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("cf-connecting-ip") ??
    "unknown";

  if (isRateLimited(clientIp)) {
    return new Response(
      JSON.stringify({ reply: "You're sending too many messages. Please wait a moment and try again." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const body: ChatRequest = await req.json();
    const userMessage = body.message?.trim();

    if (!userMessage) {
      return new Response(
        JSON.stringify({ reply: "Please send a message to get started!" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiKey = Deno.env.get("GROQ_API_KEY");
    if (!apiKey) {
      console.error("GROQ_API_KEY not set");
      return new Response(
        JSON.stringify({ reply: "The assistant is temporarily unavailable. Please try again later." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Build messages array: system + last 10 history messages + current user message
    const history = (body.history ?? []).slice(-10);
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history,
      { role: "user", content: userMessage },
    ];

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 500,
        messages,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("Groq API error:", groqResponse.status, errorText);
      return new Response(
        JSON.stringify({ reply: "Something went wrong while generating a response. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const groqData = await groqResponse.json();
    const reply = groqData.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";

    return new Response(
      JSON.stringify({ reply }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ reply: "Something went wrong. Please try again later." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
