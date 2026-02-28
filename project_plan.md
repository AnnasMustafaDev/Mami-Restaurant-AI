# 🍷 MaMi's Food & Wine — Full-Stack Project Plan

> **AI-Powered Restaurant Website with LLM Chat, Reservations & Voice Assistant**

---

## 1. Project Overview

**MaMi's Food & Wine** is a modern, small-restaurant digital experience combining a beautifully designed website with an AI-powered chatbot and voice assistant. Guests can browse the menu, make reservations, get personalized food & wine recommendations — all through natural conversation (text or voice).

| Detail            | Value                                                    |
| ----------------- | -------------------------------------------------------- |
| **Client**        | MaMi's Food & Wine (Small Restaurant)                   |
| **Type**          | Full-Stack Web App + AI Conversational System            |
| **Backend**       | FastAPI (Python)                                         |
| **Frontend**      | React.js + Tailwind CSS                                  |
| **AI/LLM**        | OpenAI GPT-4o / Claude API                               |
| **Voice**         | LiveKit + Deepgram STT + ElevenLabs / OpenAI TTS         |
| **Database**      | SQLite (dev) + Redis (cache, optional)                   |
| **Deployment**    | Docker → AWS / Vercel + Railway                          |
| **Timeline**      | 10–14 weeks                                              |

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React.js)                 │
│  ┌────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │  Menu  │  │ Reserve  │  │ LLM Chat │  │ Voice UI  │ │
│  │ Browse │  │  System  │  │  Widget  │  │ Assistant │ │
│  └───┬────┘  └────┬─────┘  └────┬─────┘  └─────┬─────┘ │
│      │            │             │               │       │
└──────┼────────────┼─────────────┼───────────────┼───────┘
       │            │             │               │
       ▼            ▼             ▼               ▼
┌─────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI)                      │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌───────────┐ │
│  │ Menu API │ │ Booking   │ │ LLM      │ │ LiveKit   │ │
│  │          │ │ Engine    │ │ Orchestr.│ │ Voice     │ │
│  └────┬─────┘ └─────┬─────┘ └────┬─────┘ └─────┬─────┘ │
│       │             │            │              │       │
│  ┌────▼─────────────▼────────────▼──────────────▼─────┐ │
│  │              Service Layer / Business Logic         │ │
│  └────────────────────────┬───────────────────────────┘ │
└───────────────────────────┼─────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
   ┌───────────┐    ┌─────────────┐    ┌─────────────┐
   │ PostgreSQL │    │    Redis    │    │  LLM APIs   │
   │ (Data)     │    │  (Cache/    │    │ (GPT-4o /   │
   │            │    │   Sessions) │    │  Claude)    │
   └───────────┘    └─────────────┘    └─────────────┘
```

---

## 3. Tech Stack — Recommended Libraries & Frameworks

### 3.1 Frontend

| Category              | Recommendation                        | Why                                                              |
| --------------------- | ------------------------------------- | ---------------------------------------------------------------- |
| **Framework**         | React 18+ (Vite)                      | Fast dev, huge ecosystem, component-based                        |
| **Styling**           | Tailwind CSS 3 + Framer Motion        | Rapid beautiful UI + elegant animations                          |
| **Component Library** | shadcn/ui                             | Accessible, customizable, modern restaurant aesthetic            |
| **State Management**  | Zustand                               | Lightweight, simpler than Redux for this scale                   |
| **Routing**           | React Router v6                       | Standard SPA routing                                             |
| **Chat UI**           | `@chatscope/chat-ui-kit-react`        | Pre-built chat components, or custom-built with Tailwind         |
| **Voice UI**          | `livekit-client` + `@livekit/components-react` | Real-time voice rooms, built-in UI components          |
| **Forms**             | React Hook Form + Zod                 | Performant forms with schema validation for reservations         |
| **Date Picker**       | `react-day-picker`                    | Clean date/time selection for bookings                           |
| **HTTP Client**       | TanStack Query (React Query) + Axios  | Caching, loading states, error handling out of the box           |
| **Icons**             | Lucide React                          | Beautiful, consistent icon set                                   |
| **Toast/Notifs**      | Sonner                                | Elegant notification toasts                                      |
| **SEO**               | React Helmet Async                    | Meta tags for restaurant discoverability                         |

### 3.2 Backend

| Category              | Recommendation                        | Why                                                              |
| --------------------- | ------------------------------------- | ---------------------------------------------------------------- |
| **Framework**         | FastAPI 0.110+                        | Async, fast, auto docs, Pydantic v2 integration                  |
| **ORM**               | SQLAlchemy 2.0 + Alembic              | Async ORM + migrations                                           |
| **Database**          | SQLite 3 (via `aiosqlite`)            | Simple local file DB, no server needed, great for dev/small scale|
| **Cache/Sessions**    | In-memory dict (dev) / Redis (prod)   | Chat session memory, rate limiting, caching                      |
| **Auth**              | `PyJWT` + `bcrypt` (JWT)              | Lightweight auth for admin panel (both actively maintained)      |
| **LLM Orchestration** | LangChain / LlamaIndex **or** raw SDK | See section 3.3 below                                           |
| **Voice Server**      | `livekit-server-sdk` (Python)         | Token generation, room management                                |
| **Email/SMS**         | Resend (email) + Twilio (SMS)         | Reservation confirmations                                        |
| **Task Queue**        | Celery + Redis **or** `arq`           | Background jobs (reminders, email sends)                         |
| **Validation**        | Pydantic v2                           | Request/response models, settings management                     |
| **CORS**              | FastAPI built-in CORSMiddleware       | Secure cross-origin for React frontend                           |
| **Testing**           | pytest + httpx (AsyncClient)          | Async-first testing                                              |

### 3.3 AI / LLM Layer

| Category                  | Option A (Recommended)                  | Option B (Lightweight)              |
| ------------------------- | --------------------------------------- | ----------------------------------- |
| **LLM Provider**          | OpenAI GPT-4o API                       | Anthropic Claude 3.5 Sonnet API     |
| **Orchestration**         | LangChain (LCEL chains)                 | Raw SDK calls + custom prompt mgmt  |
| **Function Calling**      | OpenAI tool_choice / Claude tools       | Native to both SDKs                 |
| **Conversation Memory**   | LangChain ConversationBufferMemory      | Custom Redis-backed memory          |
| **Embeddings (optional)** | OpenAI `text-embedding-3-small`         | For semantic menu search            |
| **Vector Store**          | ChromaDB or pgvector                    | Only if doing RAG over wine catalog |
| **Prompt Management**     | LangSmith / custom YAML templates       | Version-controlled prompts          |

### 3.4 Voice Assistant Stack

| Component             | Recommendation                               | Alternative                    |
| --------------------- | -------------------------------------------- | ------------------------------ |
| **Real-Time Infra**   | **LiveKit** (self-hosted or Cloud)            | Daily.co, Twilio Voice         |
| **STT (Speech→Text)** | Deepgram Nova-2                               | OpenAI Whisper API, AssemblyAI |
| **TTS (Text→Speech)** | ElevenLabs (warm, natural voices)             | OpenAI TTS, PlayHT, LMNT      |
| **Voice Agent**       | **LiveKit Agents** (Python framework)         | Build from scratch             |
| **Wake Word**         | Picovoice Porcupine (optional, for kiosk)     | —                              |
| **Noise Suppression** | LiveKit Krisp integration                     | RNNoise                        |

> **Why LiveKit?** It provides an open-source, end-to-end real-time voice pipeline with built-in agent support. The `livekit-agents` Python SDK lets you wire STT → LLM → TTS into a single pipeline with minimal code, including turn detection, interruption handling, and streaming — things that are extremely hard to build from scratch.

---

## 4. Feature Breakdown

### 4.1 Public Website

| Page / Section        | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| **Home / Hero**       | Full-bleed imagery, tagline, CTA to reserve or chat                         |
| **Menu**              | Categorized menu (starters, mains, desserts, wines) with filters & search   |
| **Reservations**      | Date, time, party size, special requests — with real-time availability      |
| **About**             | Story of MaMi's, chef bio, philosophy                                       |
| **Gallery**           | Masonry grid of food/ambiance photos                                        |
| **Contact**           | Location map (Google Maps embed), hours, phone                              |
| **AI Chat Widget**    | Floating bottom-right chat bubble, expandable                               |
| **Voice Assistant**   | Mic button in chat widget or standalone voice mode                          |

### 4.2 LLM Chatbot Capabilities

The chatbot acts as a **virtual sommelier / host** with the following tool-calling functions:

```
┌─────────────────────────────────────────────┐
│            LLM FUNCTION TOOLS               │
├─────────────────────────────────────────────┤
│  🍽️  get_menu(category, dietary_pref)       │
│  🍷  recommend_wine(dish, budget, taste)    │
│  📅  check_availability(date, time, guests) │
│  📝  make_reservation(details)              │
│  ❌  cancel_reservation(booking_id)         │
│  ℹ️  get_restaurant_info(topic)             │
│  🧑‍🍳  get_daily_specials()                  │
│  ⭐  get_popular_dishes()                   │
└─────────────────────────────────────────────┘
```

**System Prompt Personality:**
> *"You are Sofia, the virtual host of MaMi's Food & Wine. You're warm, knowledgeable about Italian-Mediterranean cuisine and natural wines, and you speak with the welcoming charm of a family-run restaurant. Keep responses concise and helpful. You can help guests browse the menu, recommend perfect wine pairings, and make or manage reservations."*

### 4.3 Voice Assistant Flow

```
Guest speaks → LiveKit captures audio
  → Deepgram STT (streaming transcription)
    → LLM processes text + function calling
      → Response generated
        → ElevenLabs TTS (streaming synthesis)
          → LiveKit plays audio back to guest
```

**Key Behaviors:**
- Natural turn-taking with interruption support
- Streaming responses (TTS starts before LLM finishes)
- Graceful fallback: "Let me transfer you to our team" → shows phone number
- Language detection: English + Italian greetings

---

## 5. Database Schema (Core)

```sql
-- SQLite-compatible schema (no arrays, no JSONB — use TEXT + JSON strings)

-- Admin Users (for JWT auth)
CREATE TABLE admin_users (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    email          TEXT UNIQUE NOT NULL,
    password_hash  TEXT NOT NULL,
    role           TEXT DEFAULT 'admin',
    created_at     TEXT DEFAULT (datetime('now'))
);

-- Menu Items
CREATE TABLE menu_items (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    description   TEXT,
    category      TEXT,                 -- starter, main, dessert, wine
    price         REAL NOT NULL,
    dietary_tags  TEXT,                 -- JSON array string: '["vegan","gluten-free"]'
    image_url     TEXT,
    is_available  INTEGER DEFAULT 1,   -- 0/1 boolean
    is_special    INTEGER DEFAULT 0,
    created_at    TEXT DEFAULT (datetime('now'))
);

-- Wine Pairings (many-to-many: a dish can pair with multiple wines)
CREATE TABLE wine_pairings (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    dish_id      INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    wine_id      INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    notes        TEXT,
    UNIQUE(dish_id, wine_id)
);

-- Restaurant Tables (needed for availability checks)
CREATE TABLE restaurant_tables (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    table_number  TEXT UNIQUE NOT NULL,
    capacity      INTEGER NOT NULL,
    is_active     INTEGER DEFAULT 1
);

-- Reservations (with table assignment for concurrency control)
CREATE TABLE reservations (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_ref     TEXT UNIQUE NOT NULL,
    guest_name      TEXT NOT NULL,
    guest_email     TEXT,
    guest_phone     TEXT,
    party_size      INTEGER NOT NULL,
    date            TEXT NOT NULL,       -- 'YYYY-MM-DD'
    time_slot       TEXT NOT NULL,       -- 'HH:MM'
    table_id        INTEGER REFERENCES restaurant_tables(id),
    special_requests TEXT,
    status          TEXT DEFAULT 'confirmed',   -- confirmed, cancelled, completed
    source          TEXT DEFAULT 'web',          -- web, chat, voice
    created_at      TEXT DEFAULT (datetime('now')),
    UNIQUE(table_id, date, time_slot)
);

-- Chat Sessions
CREATE TABLE chat_sessions (
    id             TEXT PRIMARY KEY,    -- UUID as text string
    started_at     TEXT DEFAULT (datetime('now')),
    ended_at       TEXT,
    message_count  INTEGER DEFAULT 0,
    source         TEXT,               -- text, voice
    reservation_id INTEGER REFERENCES reservations(id)
);

-- Chat Messages (individual messages within a session)
CREATE TABLE chat_messages (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id   TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role         TEXT NOT NULL,         -- user, assistant, system
    content      TEXT NOT NULL,
    tool_calls   TEXT,                  -- JSON string for function calling metadata
    created_at   TEXT DEFAULT (datetime('now'))
);

-- Restaurant Config (hours, capacity, etc.)
CREATE TABLE restaurant_config (
    key    TEXT PRIMARY KEY,
    value  TEXT NOT NULL               -- JSON string
);
```

---

## 6. API Endpoints (FastAPI)

### Public API

```
GET    /api/health                       → Health check (for deployment probes)
GET    /api/menu                         → Full menu (filterable by category, dietary_tags)
GET    /api/menu/{id}                    → Single item detail with wine pairings
GET    /api/menu/specials                → Today's specials
GET    /api/availability?date&time&guests → Check table availability
POST   /api/reservations                 → Create reservation (uses SELECT FOR UPDATE)
GET    /api/reservations/{ref}           → Lookup reservation by booking ref
DELETE /api/reservations/{ref}           → Cancel reservation
POST   /api/chat/sessions               → Create new chat session
POST   /api/chat/sessions/{id}/messages  → Send message (SSE streamed response)
POST   /api/chat/voice-token             → Get LiveKit room token for voice session
GET    /api/restaurant/info              → Hours, location, about
```

### Admin API (JWT Protected)

```
POST   /api/admin/login                 → Admin authentication
CRUD   /api/admin/menu                  → Manage menu items
GET    /api/admin/reservations          → View all reservations
PATCH  /api/admin/reservations/{id}     → Update reservation status
GET    /api/admin/analytics             → Chat usage, reservation stats
PUT    /api/admin/config                → Update hours, capacity, specials
```

---

## 7. Design System

### 7.1 Brand Identity

| Element            | Value                                                                 |
| ------------------ | --------------------------------------------------------------------- |
| **Vibe**           | Warm, intimate, modern Italian bistro — not corporate                 |
| **Mood**           | Candlelit dinner meets clean digital design                           |
| **Typography**     | Headings: `Playfair Display` (serif, elegant) / Body: `Inter` (clean)|
| **Logo Treatment** | Script-style "MaMi's" with a subtle wine glass or grape vine motif   |

### 7.2 Color Palette

```
Primary (Wine):       #722F37   ██  — Deep burgundy/wine red
Primary Dark:         #4A1C23   ██  — Rich dark wine
Accent (Gold):        #C9A96E   ██  — Warm gold, wine label feel
Background:           #FDF8F4   ██  — Warm cream/off-white
Surface:              #FFFFFF   ██  — Card backgrounds
Text Primary:         #1A1A1A   ██  — Near-black
Text Secondary:       #6B5C56   ██  — Warm gray
Success (Olive):      #5C7A3B   ██  — Confirmation/available
Error:                #B33A3A   ██  — Cancellation/error
```

### 7.3 UI Component Patterns

**Chat Widget:**
- Floating button: wine-colored circle with chat icon, bottom-right
- Expanded: 400px wide × 600px tall card with frosted glass effect
- Messages: guest (right, light bg) vs Sofia (left, wine-tinted bg)
- Quick-reply chips: "See menu", "Make reservation", "Wine pairing"
- Mic button toggles voice mode (pulses when listening)

**Reservation Flow:**
```
Step 1: Select Date    →  Calendar with available dates highlighted (green)
Step 2: Select Time    →  Time slot grid (30-min intervals), grayed if full
Step 3: Party Details  →  Guest count, name, email, phone, special requests
Step 4: Confirmation   →  Summary card + "Confirm" CTA → success animation
```

**Menu Page:**
- Horizontal category tabs (sticky on scroll)
- Cards: image left, details right, dietary badges, price
- Wine items: show grape, region, tasting notes
- Hover: subtle scale + shadow lift

### 7.4 Responsive Breakpoints

```
Mobile:   < 640px    → Single column, bottom sheet for chat, hamburger nav
Tablet:   640–1024px → Two-column menu, side-panel chat
Desktop:  > 1024px   → Full layout, floating chat widget
```

### 7.5 Animations & Micro-Interactions

- **Page transitions:** Fade + slight upward slide (Framer Motion)
- **Menu cards:** Staggered entrance animation on scroll
- **Chat bubble:** Bounce-in on first appearance, pulse notification dot
- **Voice mode:** Audio waveform visualization while speaking / listening
- **Reservation confirm:** Confetti or checkmark lottie animation
- **Loading states:** Skeleton screens with warm shimmer

---

## 8. Voice Assistant — LiveKit Implementation Detail

### 8.1 LiveKit Agent (Python Backend)

```python
# Simplified LiveKit Agent Pipeline
from livekit.agents import AgentSession, Agent
from livekit.agents.llm import function_tool
from livekit.plugins import deepgram, openai, elevenlabs

class MaMiVoiceAgent(Agent):
    def __init__(self):
        super().__init__(
            instructions=SOFIA_SYSTEM_PROMPT,
            stt=deepgram.STT(model="nova-2", language="en"),
            llm=openai.LLM(model="gpt-4o"),
            tts=elevenlabs.TTS(
                voice_id="<warm-female-voice-id>",
                model="eleven_turbo_v2_5"
            ),
        )

    @function_tool
    async def check_availability(self, date: str, time: str, guests: int):
        """Check if a table is available."""
        # Calls internal reservation service
        ...

    @function_tool
    async def make_reservation(self, name: str, date: str, time: str, guests: int):
        """Book a table for the guest."""
        ...

    @function_tool
    async def recommend_wine(self, dish: str, preference: str):
        """Suggest a wine pairing."""
        ...
```

### 8.2 Frontend Voice Integration

```jsx
// React component using LiveKit
import { LiveKitRoom, useVoiceAssistant } from "@livekit/components-react";

function VoiceAssistant({ token, serverUrl }) {
  return (
    <LiveKitRoom token={token} serverUrl={serverUrl}>
      <VoiceUI />
    </LiveKitRoom>
  );
}

function VoiceUI() {
  const { state, audioTrack } = useVoiceAssistant();
  // state: "listening" | "thinking" | "speaking" | "idle"

  return (
    <div className="voice-orb">
      <AudioVisualizer track={audioTrack} />
      <span>{state === "listening" ? "Listening..." : "Tap to speak"}</span>
    </div>
  );
}
```

---

## 9. Project Phases & Timeline

### Phase 1 — Foundation (Weeks 1–3)

- [ ] Project setup: Makefile + Docker Compose, CI/CD
- [ ] Database schema + migrations (Alembic)
- [ ] FastAPI boilerplate: auth, CORS, error handling, config
- [ ] React app scaffold: routing, Tailwind, layout components
- [ ] Design system: colors, typography, base components in Storybook
- [ ] Menu CRUD API + seed data

### Phase 2 — Core Website (Weeks 4–6)

- [ ] Home page with hero, about section, CTA
- [ ] Menu browsing page with filters and search
- [ ] Reservation system (frontend + backend + availability logic)
- [ ] Contact / location page with map embed
- [ ] Gallery page
- [ ] Admin panel: menu management, reservation dashboard
- [ ] Email confirmations (Resend integration)

### Phase 3 — LLM Chat Integration (Weeks 7–9)

- [ ] LLM service: prompt engineering, function tool definitions
- [ ] Chat API endpoint with streaming (SSE)
- [ ] Redis-backed conversation memory
- [ ] Chat widget UI: message bubbles, quick replies, typing indicator
- [ ] Menu recommendation logic (dietary prefs, wine pairing)
- [ ] Reservation flow through chat
- [ ] Edge cases: off-topic handling, graceful errors
- [ ] Prompt iteration & testing

### Phase 4 — Voice Assistant (Weeks 10–12)

- [ ] LiveKit server setup (Cloud or self-hosted)
- [ ] LiveKit Agent: STT → LLM → TTS pipeline
- [ ] Token generation endpoint
- [ ] Frontend voice UI: mic button, audio visualizer, state display
- [ ] Interruption handling & turn detection tuning
- [ ] Voice-specific prompt adjustments (shorter, more conversational)
- [ ] Fallback to text chat on voice failure

### Phase 5 — Polish & Launch (Weeks 13–14)

- [ ] Performance optimization (Lighthouse audit, lazy loading, caching)
- [ ] SEO: meta tags, structured data (Restaurant schema.org)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Mobile responsiveness QA
- [ ] Analytics: Plausible / PostHog for usage tracking
- [ ] Load testing (chat & voice concurrent sessions)
- [ ] Staging deployment → client review → production launch

---

## 10. Infrastructure & Deployment

```
┌─────────────────────────────────────────┐
│          LOCAL DEVELOPMENT              │
│                                         │
│  Frontend:  Vite dev server (:5173)     │
│  Backend:   Uvicorn (FastAPI) (:8000)   │
│  Database:  SQLite (./data/mami.db)     │
│  Cache:     In-memory (dev)             │
│  Voice:     LiveKit Cloud (free tier)   │
│  Email:     Console logger (dev)        │
└─────────────────────────────────────────┘

         PRODUCTION (future)
┌─────────────────────────────────────────┐
│  Frontend:  Vercel (React + SSG/SSR)    │
│  Backend:   Railway / Render (FastAPI)  │
│  Database:  PostgreSQL (Neon)           │
│  Cache:     Upstash Redis               │
│  Voice:     LiveKit Cloud               │
│  Files:     Cloudflare R2 / S3          │
│  Email:     Resend                      │
│  Monitoring: Sentry + Better Stack      │
│  CI/CD:     GitHub Actions              │
└─────────────────────────────────────────┘
```

**Local Environment Setup:**

```bash
# No Docker required for dev — just run:

# Terminal 1: Backend
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend && npm run dev

# SQLite DB auto-created at backend/data/mami.db
```

---

## 11. Cost Estimates (Monthly — Post-Launch)

| Service               | Estimated Cost     | Notes                              |
| --------------------- | ------------------ | ---------------------------------- |
| Vercel (Frontend)     | $0–20              | Free tier likely sufficient        |
| Railway (Backend)     | $5–20              | Based on usage                     |
| Neon Postgres         | $0–19              | Free tier: 0.5GB                   |
| Upstash Redis         | $0–10              | Free tier: 10K commands/day        |
| OpenAI API (GPT-4o)   | $30–100            | ~1,000–5,000 chat sessions/month   |
| Deepgram STT          | $15–50             | ~50–200 voice hours                |
| ElevenLabs TTS        | $22–99             | Based on character count           |
| LiveKit Cloud         | $0–50              | Based on participant minutes       |
| Resend (Email)        | $0                 | Free tier: 3,000 emails/month      |
| Domain + DNS          | $12/year           | Cloudflare                         |
| **Total**             | **$85–370/month**  | Scales with usage                  |

---

## 12. Key Technical Decisions

### Build vs. Buy — Voice Assistant

| Approach                    | Pros                                    | Cons                                      |
| --------------------------- | --------------------------------------- | ----------------------------------------- |
| **LiveKit Agents** ✅        | Full pipeline in one framework, open-source, handles turn-taking, interruptions, streaming | Learning curve, infra to manage |
| **From Scratch** (WebRTC + manual STT/TTS) | Full control, no vendor lock-in | 3–5x development time, hard edge cases (echo, noise, turn detection) |
| **Vapi / Retell / Bland**   | Fastest launch, hosted                  | Less customizable, higher per-minute cost, vendor lock-in |

**Recommendation:** Use **LiveKit Agents** — best balance of control, cost, and development speed for a restaurant use case.

### LLM Orchestration

| Approach                  | When to Use                                          |
| ------------------------- | ---------------------------------------------------- |
| **Raw SDK (OpenAI/Claude)** | Simple chatbot, < 5 tools, straightforward flows     |
| **LangChain**              | Complex chains, RAG over wine catalog, memory mgmt   |
| **LlamaIndex**             | Heavy document retrieval (e.g., wine database)       |

**Recommendation:** Start with **raw SDK + function calling** — it's simpler, faster, and sufficient for a restaurant chatbot. Migrate to LangChain only if you add RAG features (e.g., searching through a large wine catalog with descriptions).

---

## 13. Folder Structure

```
mami-food-wine/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui base components
│   │   │   ├── layout/          # Header, Footer, Navigation
│   │   │   ├── menu/            # MenuCard, MenuFilter, MenuGrid
│   │   │   ├── reservation/     # ReservationForm, TimeSlotPicker
│   │   │   ├── chat/            # ChatWidget, ChatBubble, QuickReplies
│   │   │   └── voice/           # VoiceOrb, AudioVisualizer
│   │   ├── pages/               # Home, Menu, Reserve, About, Contact
│   │   ├── hooks/               # useChat, useVoice, useReservation
│   │   ├── services/            # API client functions
│   │   ├── stores/              # Zustand stores
│   │   ├── styles/              # Global CSS, Tailwind config
│   │   └── utils/               # Helpers, constants
│   ├── public/                  # Static assets, fonts, images
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/          # menu.py, reservations.py, chat.py, admin.py
│   │   │   └── deps.py          # Dependencies (DB, auth, etc.)
│   │   ├── core/
│   │   │   ├── config.py        # Settings (Pydantic BaseSettings)
│   │   │   ├── security.py      # JWT, hashing
│   │   │   └── database.py      # Async SQLAlchemy engine
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── menu_service.py
│   │   │   ├── reservation_service.py
│   │   │   ├── llm_service.py   # LLM orchestration, tool definitions
│   │   │   └── voice_service.py # LiveKit token generation
│   │   ├── agents/
│   │   │   └── voice_agent.py   # LiveKit Agent definition
│   │   ├── prompts/             # System prompts (YAML/txt)
│   │   └── main.py              # FastAPI app entry point
│   ├── alembic/                 # Database migrations
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
├── README.md
└── Makefile
```

---

## 14. Success Metrics

| Metric                        | Target (3 months post-launch)   |
| ----------------------------- | ------------------------------- |
| Online reservations via chat  | 30% of total bookings           |
| Chat engagement rate          | 15% of site visitors            |
| Voice assistant usage         | 5% of chat users try voice      |
| Average chat satisfaction     | 4.2+ / 5 (post-chat survey)    |
| Reservation no-show rate      | < 10% (with SMS reminders)      |
| Page load time                | < 2s (LCP)                      |
| Mobile traffic share          | > 60%                           |

---

## 15. Future Enhancements (V2+)

- **WhatsApp / Instagram DM** integration (same LLM backend)
- **Loyalty program** with points tracking via chat
- **Multi-language support** (Italian, Spanish, German)
- **AI-powered upselling** ("Would you like to add our house tiramisu?")
- **Table-side ordering** via QR code → voice/chat
- **Review analysis** — sentiment dashboard from Google/Yelp reviews
- **Dynamic pricing** for off-peak reservation incentives

---

*Built with ❤️ for MaMi's Food & Wine — Where every meal is a conversation.*