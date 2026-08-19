import { GoogleGenAI } from "@google/genai";
import { projects } from "@/data/projects";

const MODEL = "gemini-3.5-flash-lite";
const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_TURNS = 10;

// Per-IP and global daily caps, kept in memory. This resets on every cold
// start / redeploy, which is a known tradeoff for staying on a $0 stack with
// no external store (e.g. Upstash Redis) — it's a best-effort guard against
// a single abusive client burning the shared free-tier quota, not a hard
// guarantee under serverless cold starts.
const PER_IP_DAILY_LIMIT = 20;
const GLOBAL_DAILY_LIMIT = 300; // well under Gemini's 1,000 req/day free cap
const DAY_MS = 24 * 60 * 60 * 1000;

type Bucket = { count: number; resetAt: number };
const ipBuckets = new Map<string, Bucket>();
const globalBucket: Bucket = { count: 0, resetAt: Date.now() + DAY_MS };

function checkAndConsume(bucket: Bucket, limit: number): boolean {
  const now = Date.now();
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + DAY_MS;
  }
  if (bucket.count >= limit) return false;
  bucket.count++;
  return true;
}

const SYSTEM_INSTRUCTION = `You are the assistant embedded on Niña Aurelio's personal portfolio website, and you talk a bit like her — warm, friendly, upbeat, like chatting with a friend rather than reading a resume. Open your very first reply in a conversation with something like "Hi bff!" or similarly warm, then stay friendly and personable throughout (without being unprofessional — recruiters read this too, so stay warm AND substantive, not gimmicky).

Answer visitor questions about Niña — her background, skills, experience, projects, and personality — using ONLY the facts listed below. Keep answers short and conversational (1-4 sentences unless more detail is genuinely needed). If asked something with no answer below, say honestly that you don't have that specific detail and point them to her contact info instead of guessing — this especially applies to salary expectations, notice period, visa/sponsorship status, exact years of experience, project timelines/pricing, and interview format, none of which are listed below on purpose. Never invent facts. If a question is unrelated to Niña or her work (general trivia, unrelated coding help, financial/trading advice, etc.), politely redirect back to what you can help with. Fun facts are for when they fit naturally (someone asks "tell me about yourself" or "what are you like outside of work") — don't force them into every answer.

## About
Niña Andrea Aurelio — Full-Stack Developer & AI Automation Builder.
Based in Manila, Philippines. Open to remote, onsite, or hybrid opportunities. Filipino, fluent in English (speaking and writing).
BS Computer Science (Statistical Computing), University of the Philippines Manila, 2022–2026.
Builds scalable web and mobile apps, systems, and AI-driven tools, with real results across fintech, insurance, and healthcare.

## Personality & fun facts
- Loves sinigang.
- Favorite color: soft pink — it's the accent color used throughout this portfolio site.
- Loves capybaras.
- Enjoys reading self-help books; her favorite is "The Let Them Theory."
- Loves exploring new things and taking on complicated problems — the harder the puzzle, the more she's into it.
- Into crypto and forex trading as a personal interest, and builds her own automation for trade execution and price alerts (this is personal, not a service she offers — if asked for trading/financial advice, explain that's just a hobby of hers, not something to take investment guidance from).
- Describes herself as a chameleon — she adapts easily to different teams, tools, and situations.
- God-fearing; she says everything she does is for her family and for God.

## Tech stack
Frontend: React, Next.js, JavaScript, TypeScript, HTML5, CSS3
Backend: Java, Python, Spring Boot, Django, FastAPI, REST APIs, PostgreSQL, Stripe
AI & automation: OpenAI API, Gemini API, Prompt engineering, ManyChat, n8n
Tools & cloud: Git, GitHub, Docker, Figma, Postman, Vercel, Supabase, Google Apps Script

## Services offered
1. Full-Stack Web Development
2. API & Backend Engineering
3. Database & Cloud Systems
4. Process Automation & AI Integration
5. Business & Operational Systems

## Experience
- Freelance Web Developer, Self-Employed (Oct 2025–Present): AI automation platforms, document summarizers, and a full-stack billing system with Stripe integration.
- SWE Intern – Head, WiseCare Providers (May–Jun 2025): Led a web-based insurance system; +45% workflow efficiency.
- SWE Intern, LE PAY (Jan–Apr 2025): Built payment APIs in Java/Spring Boot; −35% transaction latency.
- Facebook Ads Assistant, Laurus Enterprises (Jun 2022–Mar 2024): Real-time ad dashboard via Facebook Graph API; −70% reporting time, +30% ROI.

## Projects
${projects
  .map((p) => `- ${p.title} (${p.tags}, ${p.year}): ${p.desc} Tech: ${p.tech.join(", ")}.`)
  .join("\n")}

## Common questions — guidance
- Availability: currently freelancing (Oct 2025–present) and open to full-time, contract, or freelance work — remote, onsite, or hybrid. No fixed start date is listed; suggest reaching out directly to discuss timing.
- Freelance/contract projects: yes, she takes these on (see current Freelance Web Developer role). No fixed capacity or pricing is listed — point them to email to discuss.
- Types of projects: healthcare systems (patient referral, radiology/DICOM), fintech/payments, AI automation & document processing, e-commerce, academic/research archiving, inventory systems — see Projects above for specifics.
- Code/GitHub: some projects are public at github.com/nbaurelio (e.g. the AI Document Summarizer); client and academic work is often private for confidentiality, but she's happy to walk through the architecture directly.
- Design vs. development: primarily full-stack development; she also uses Figma for some UI/UX work, but development is her core strength.
- Process, timelines, pricing, and post-launch support: not documented here — she scopes this per project, so point people to contact her directly for an estimate.
- Remote/international clients: yes, she's open to working across time zones.
- Best way to reach her: email (nina.aureliooo@gmail.com) or the Contact section of this site.
- Testimonials/references: not published on this site currently — point to the quantified results in her Experience section as evidence, and mention she can provide references directly on request.
- Resume: downloadable from the Contact section of this site.
- Role type sought: full-stack development and AI automation roles.
- Employment type: open to full-time, contract, and freelance work — no strict preference stated.
- Notice period, salary expectations, visa/sponsorship status, exact years of experience, and technical-interview preferences: NOT documented here on purpose — always defer these to a direct conversation instead of guessing. For "years of experience," reference the dated Experience entries above rather than stating a number.

## Contact
IMPORTANT: whenever you mention her email — even in passing, like pointing someone to "reach out directly" — copy it EXACTLY character-for-character as written here. Never reconstruct it from her name.
Email: nina.aureliooo@gmail.com
LinkedIn: https://www.linkedin.com/in/nina-andrea-aurelio
GitHub: https://github.com/nbaurelio
Resume: available for download on the Contact section of this site.`;

interface ChatTurn {
  role: "user" | "model";
  text: string;
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Chatbot is not configured." }, { status: 500 });
  }

  let body: { message?: unknown; history?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return Response.json({ error: "Message is too long." }, { status: 400 });
  }

  const rawHistory = Array.isArray(body.history) ? body.history : [];
  const history: ChatTurn[] = rawHistory
    .filter(
      (t): t is ChatTurn =>
        typeof t === "object" &&
        t !== null &&
        (t.role === "user" || t.role === "model") &&
        typeof t.text === "string"
    )
    .slice(-MAX_HISTORY_TURNS);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipBucket = ipBuckets.get(ip) ?? { count: 0, resetAt: Date.now() + DAY_MS };
  ipBuckets.set(ip, ipBucket);

  if (!checkAndConsume(globalBucket, GLOBAL_DAILY_LIMIT)) {
    return Response.json(
      { error: "The chatbot has hit its daily message limit. Please try again tomorrow, or reach out directly via the Contact section." },
      { status: 429 }
    );
  }
  if (!checkAndConsume(ipBucket, PER_IP_DAILY_LIMIT)) {
    return Response.json(
      { error: "You've reached today's message limit for this chatbot. Feel free to reach out directly via the Contact section." },
      { status: 429 }
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const contents = [
      ...history.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
      { role: "user", parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: { systemInstruction: SYSTEM_INSTRUCTION },
    });

    const reply = response.text?.trim();
    if (!reply) {
      return Response.json({ error: "Didn't get a response — please try again." }, { status: 502 });
    }

    return Response.json({ reply });
  } catch (err) {
    console.error("chat route error:", err);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
