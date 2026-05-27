# VedaAI — AI Assessment Creator

A tool for teachers to create an assignment, generate a complete question paper with AI, and view or download it as a clean exam paper. Built to the VedaAI Figma designs.

- **Live demo:** https://vedaai-assessment-creator-xj7e.vercel.app
- **API:** https://vedaai-assessment-creator-3eja.onrender.com/

The teacher fills a short form — assessment name, class, due date, the question types they want (each with a count and marks), optional notes, and an optional image of their own material. That request is queued; a background worker turns it into a structured prompt, calls the LLM, validates the response into a typed paper, stores it, and streams the status back to the browser in real time. The paper page renders it like a real exam and exports a properly formatted PDF.

---

## What it does

**Create an assignment**
- Assessment name, class, due date, repeatable question-type rows (type + number of questions + marks each), additional instructions, and an optional file upload.
- Full validation on both client and server — no empty fields, no zero or negative counts/marks, no past due dates.
- Form state is held in **Zustand**.

**Generate the paper with AI**
- The form is converted into a structured prompt with explicit, per-type rules: multiple choice gets exactly four options, true/false gets a statement, numerical gets a problem to solve, and so on.
- The model's reply is parsed and checked against a **Zod schema** before anything reaches the screen — the raw LLM text is never rendered. If the JSON is malformed the worker repairs once, then fails the job cleanly.
- Every paper has sections (A, B, …), and every question carries a difficulty (Easy / Moderate / Challenging) and marks. An answer key is generated alongside.
- If you upload an image of notes, the model reads it; your saved school details are used for the paper's header.

**View the output**
- Student info lines (Name / Roll Number / Section), each section with its title and instruction, every question tagged with difficulty and marks, and an answer key — laid out like a real paper and fully responsive on mobile.

**Real-time, non-blocking flow**
- After you submit, the output page shows live phases — Analyzing inputs → Drafting questions → Formatting & answer key → Finalizing — with a progress bar driven by the worker.
- You can leave and start another assignment while one is generating. Assignment cards show a live Generating / Ready / Failed badge, and a toast tells you when a paper is done no matter which page you're on.

**Settings**
- Set your institution (logo, name, address, city, board) and your own name and role. This drives the sidebar, the top bar, the paper header, and the greeting on each paper.

**Bonus features**
- **PDF export** — a real generated PDF (server-side through a BullMQ job using pdfkit, with a client-side `@react-pdf/renderer` fallback), not a browser print.
- **Regenerate** a paper from the output page.
- **Difficulty tags** on every question.
- **Redis caching** of finished papers, served read-through.

---

## Tech stack

**Frontend** — Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Zustand, socket.io-client, @react-pdf/renderer.

**Backend** — Node.js, Express, TypeScript, Mongoose (MongoDB), ioredis + BullMQ (Redis), Socket.IO, Zod.

**AI** — Groq: Llama 3.3 70B for text and Llama 4 Scout for reading image uploads, behind a small provider interface so the model is easy to swap.

**Infrastructure** — MongoDB Atlas, Upstash Redis, Vercel (frontend), Render (backend).

---

## Architecture

```
   Browser  (Next.js on Vercel)
      |  POST /api/assignments                 Socket.IO  <-- live status --+
      v                                                                     |
   Express API  (Render) -- enqueue --> Redis + BullMQ -- job --> Worker ---+
      |                                                            |  build prompt
      v                                                            |  -> LLM (Groq)
   MongoDB (Atlas)  <---- save assignment + validated paper -------+  -> Zod validate
                                                                      -> cache (Redis)
                                                                      -> PDF job (pdfkit)
```

The flow matches the brief: an API request adds a job to the queue, a worker processes the generation, the result is stored, and the frontend is notified over WebSocket.

The reason for the queue is that LLM calls are slow and occasionally fail. The HTTP request shouldn't wait on them, so it enqueues the work and returns an id immediately. The worker does the generation in the background and pushes progress to the browser as it goes. Redis serves double duty here — it backs the BullMQ queue and caches the finished paper so repeat reads don't hit the database.

---

## How generation works

1. `POST /api/assignments` validates the body (Zod, same rules as the form), saves the assignment as `queued`, and adds a `generate` job to BullMQ.
2. The worker marks it `processing` and emits progress over the socket at each step.
3. It builds a system + user prompt from the question config, the topic, the school profile, and any uploaded image.
4. It calls Groq and runs the JSON through the Zod schema. On a parse/validation failure it retries once with a stricter instruction; if it still fails, the assignment is marked `failed`.
5. The validated paper is saved to MongoDB, cached in Redis, and a second BullMQ job renders the PDF.
6. The worker emits `completed`; the open paper page (and the assignment card) update instantly.

Because the UI only ever renders the parsed, schema-checked object, the output is always well structured — never a raw block of model text.

---

## API

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/health` | Liveness + Mongo/Redis status |
| GET | `/api/assignments` | List assignments |
| POST | `/api/assignments` | Create one and queue generation |
| GET | `/api/assignments/:id` | Fetch one (status) |
| DELETE | `/api/assignments/:id` | Delete |
| POST | `/api/assignments/:id/regenerate` | Re-run generation |
| GET | `/api/assignments/:id/paper` | The structured paper (cached) |
| GET | `/api/assignments/:id/pdf` | The server-rendered PDF |
| GET / PUT | `/api/profile` | Read / update the school + teacher profile |
| GET | `/api/profile/logo` | The uploaded logo image |

**WebSocket** — the client emits `assignment:subscribe`/`assignment:unsubscribe` for a given id; the server emits `assignment:status` (stage, progress, result) to that room and a global `assignment:activity` event used for the live card badges and toasts.

---

## Project structure

```
/                      Next.js frontend (App Router)
  app/(app)/           shell + pages: assignments, assignments/new, assignments/[id], settings, ...
  components/          layout, form, assignments, paper, ui
  lib/                 api client, socket client, Zustand stores (assignments, draft, profile, toast)
/server                Express + TypeScript backend
  src/
    routes/            assignments + profile endpoints
    workers/           generate + pdf BullMQ workers
    ai/                provider, prompt builder, Zod schema
    models/            Mongoose models (Assignment, QuestionPaper, Profile)
    queue/, db/, socket/, pdf/
```

---

## Running locally

### Prerequisites
- Node.js 20+
- A MongoDB connection string (MongoDB Atlas free tier)
- A Redis URL (Upstash free tier), e.g. `rediss://...`
- A Groq API key (free at console.groq.com)

### Backend
```bash
cd server
cp .env.example .env       # fill in the values below
npm install
npm run dev                # http://localhost:4000
```

`server/.env`:
```
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
MONGODB_URI=<your MongoDB Atlas URI>
REDIS_URL=<your Upstash rediss:// URL>
GROQ_API_KEY=<your Groq key>
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_VISION_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
```

On boot you should see `Mongo connected`, `Redis connected`, and `Workers started (generate, pdf)`.

### Frontend
```bash
# repo root, second terminal
npm install
npm run dev                # http://localhost:3000
```

`.env.local` (repo root):
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=http://localhost:4000
```

Open http://localhost:3000, set your school under **Settings**, then create an assignment. You can confirm the backend is healthy at `http://localhost:4000/health`.

---

## Deployment

Frontend on **Vercel**, backend on **Render**, with **MongoDB Atlas** and **Upstash Redis** (all free tiers).

**Backend — Render web service** (Root Directory `server`):
- Build: `npm install && npm run build`
- Start: `npm start`
- Environment: `MONGODB_URI`, `REDIS_URL`, `GROQ_API_KEY`, `GROQ_MODEL`, `GROQ_VISION_MODEL`, and `CLIENT_ORIGIN` = your Vercel URL. Render provides `PORT` automatically. The generate and PDF workers run inside the same service.

**Frontend — Vercel** (repo root): set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` to the Render URL.

In Atlas, allow network access from anywhere (`0.0.0.0/0`) so Render can connect.
