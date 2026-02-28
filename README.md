# MaMi's Food & Wine

A full-stack AI-powered restaurant website featuring an intelligent chatbot assistant (Sofia), voice interaction, online reservations, and a complete admin panel.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Backend](#backend)
  - [Architecture](#architecture)
  - [API Endpoints](#api-endpoints)
  - [Database Models](#database-models)
  - [AI Chatbot — Sofia](#ai-chatbot--sofia)
  - [Authentication](#authentication)
  - [Seeded Data](#seeded-data)
- [Frontend](#frontend)
  - [Pages](#pages)
  - [Components](#components)
  - [Services & Hooks](#services--hooks)
  - [Styling](#styling)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Deployment](#deployment)

---

## Overview

MaMi's Food & Wine is a modern restaurant web application that combines a beautiful public-facing website with AI-powered features. Guests can browse the menu, make reservations, and interact with **Sofia** — an AI assistant powered by OpenAI GPT-4o that understands the restaurant's menu, availability, and can complete bookings through natural conversation.

**Key Features:**

- Browse full menu with category filters and dietary tags
- Multi-step online reservation flow with real-time availability
- AI chatbot (Sofia) with function calling — can check availability, make reservations, recommend wines, and answer questions
- Voice assistant mode using browser Speech Recognition and TTS
- Admin panel for managing menu items and reservations (JWT-protected)
- Fully responsive, animated UI built with Tailwind CSS and Framer Motion

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend Framework | FastAPI 0.115 |
| Backend Runtime | Python 3.11+ |
| Database (dev) | SQLite via aiosqlite |
| Database (prod) | PostgreSQL (recommended) |
| ORM | SQLAlchemy 2.0 (async) |
| Migrations | Alembic |
| AI / LLM | OpenAI GPT-4o |
| Voice | LiveKit, Deepgram STT, ElevenLabs / OpenAI TTS |
| Auth | PyJWT + bcrypt |
| Email | Resend |
| Frontend Framework | React 19 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion |
| State / Data Fetching | TanStack Query v5, Zustand |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios |
| Routing | React Router DOM v7 |

---

## Project Structure

```
personio/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app, lifespan, CORS, route registration
│   │   ├── api/
│   │   │   ├── deps.py              # Shared dependencies (DB session, admin auth)
│   │   │   └── routes/
│   │   │       ├── health.py        # GET /api/health
│   │   │       ├── menu.py          # Menu CRUD + wine pairings
│   │   │       ├── reservations.py  # Availability + reservation management
│   │   │       ├── chat.py          # Chat sessions, messages, TTS
│   │   │       ├── admin.py         # Admin login + protected management routes
│   │   │       └── restaurant.py    # Restaurant info (hours, location, about)
│   │   ├── core/
│   │   │   ├── config.py            # Pydantic settings (reads .env)
│   │   │   ├── database.py          # Async engine, session factory, DB init
│   │   │   └── security.py          # JWT creation/verification, password hashing
│   │   ├── models/                  # SQLAlchemy ORM models
│   │   │   ├── admin_user.py
│   │   │   ├── menu_item.py
│   │   │   ├── wine_pairing.py
│   │   │   ├── reservation.py
│   │   │   ├── restaurant_table.py
│   │   │   ├── chat_session.py
│   │   │   ├── chat_message.py
│   │   │   └── restaurant_config.py
│   │   ├── schemas/                 # Pydantic request/response schemas
│   │   │   ├── menu.py
│   │   │   ├── chat.py
│   │   │   ├── reservation.py
│   │   │   └── auth.py
│   │   ├── services/
│   │   │   ├── llm_service.py       # OpenAI function-calling orchestration
│   │   │   └── seed.py              # Database seed data
│   │   └── prompts/
│   │       └── sofia_system.txt     # System prompt for Sofia
│   ├── .env                         # Environment variables (not committed)
│   ├── requirements.txt
│   └── data/                        # SQLite DB file (auto-created)
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx                 # React entry point
│   │   ├── App.tsx                  # Router + QueryClient provider
│   │   ├── index.css                # Global styles, Tailwind theme
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Layout.tsx       # Page wrapper with Header, Footer, ChatWidget
│   │   │   │   ├── Header.tsx       # Navigation + mobile menu
│   │   │   │   └── Footer.tsx
│   │   │   ├── chat/
│   │   │   │   └── ChatWidget.tsx   # Floating chat UI
│   │   │   └── voice/
│   │   │       └── VoiceOrb.tsx     # Voice assistant with speech recognition
│   │   ├── pages/
│   │   │   ├── Home.tsx             # Landing page
│   │   │   ├── MenuPage.tsx         # Menu with category filters
│   │   │   ├── Reserve.tsx          # Multi-step reservation form
│   │   │   ├── About.tsx            # Restaurant story & team
│   │   │   └── Contact.tsx          # Contact form & info
│   │   ├── hooks/
│   │   │   └── useChat.ts           # Chat state hook
│   │   └── services/
│   │       └── api.ts               # Axios API client
│   ├── package.json
│   ├── vite.config.ts               # Vite config + /api proxy
│   └── tsconfig.json
│
├── project_plan.md                  # Full project specification
├── .env.example                     # Environment variable template
├── Makefile                         # Dev commands
└── README.md
```

---

## Getting Started

### Prerequisites

- **Python** 3.11 or higher
- **Node.js** 18 or higher
- **npm** or **pnpm**
- An **OpenAI API key** (required for the chatbot)
- Optional: LiveKit, Resend, and ElevenLabs accounts for voice and email features

---

### Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy the environment template and fill in your values
cp ../.env.example .env

# Start the development server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive docs (Swagger UI) at `http://localhost:8000/docs`.  
The SQLite database and seed data are created automatically on first startup.

---

### Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.  
All `/api` requests are proxied to `http://localhost:8000` via Vite's dev proxy.

---

## Environment Variables

Create a `.env` file inside the `backend/` directory using `.env.example` as a template.

| Variable | Description | Required |
|---|---|---|
| `DEBUG` | Enable debug mode (`true` / `false`) | No |
| `DATABASE_URL` | Database connection string (default: SQLite) | Yes |
| `SECRET_KEY` | General application secret | Yes |
| `JWT_SECRET_KEY` | Secret used to sign JWT tokens | Yes |
| `CORS_ORIGINS` | Comma-separated allowed origins (e.g. `http://localhost:5173`) | Yes |
| `OPENAI_API_KEY` | OpenAI API key for the Sofia chatbot | Yes |
| `OPENAI_MODEL` | OpenAI model to use (e.g. `gpt-4o`) | Yes |
| `LIVEKIT_URL` | LiveKit server URL for voice features | No |
| `LIVEKIT_API_KEY` | LiveKit API key | No |
| `LIVEKIT_API_SECRET` | LiveKit API secret | No |
| `RESEND_API_KEY` | Resend API key for transactional emails | No |

---

## Backend

### Architecture

The backend follows a layered architecture:

- **Routes** handle HTTP request/response and input validation via Pydantic schemas.
- **Services** contain business logic (LLM orchestration, seeding).
- **Models** define the database schema using SQLAlchemy ORM with async support.
- **Core** holds cross-cutting concerns: configuration, database connection, and security utilities.
- The database session is injected into route handlers as a FastAPI dependency via `deps.py`.

### API Endpoints

#### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check — returns status and timestamp |

#### Menu

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/menu` | List menu items (filterable by category, dietary tags) |
| `GET` | `/api/menu/specials` | Today's daily specials |
| `GET` | `/api/menu/{item_id}` | Get a single menu item |
| `GET` | `/api/menu/{item_id}/wine-pairings` | Wine pairings for a dish |

#### Reservations

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/reservations/availability` | Check available time slots for a date and party size |
| `POST` | `/api/reservations` | Create a new reservation |
| `GET` | `/api/reservations/{confirmation_code}` | Look up a reservation by confirmation code |
| `DELETE` | `/api/reservations/{confirmation_code}` | Cancel a reservation |

#### Chat

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/chat/sessions` | Create a new chat session |
| `POST` | `/api/chat/sessions/{session_id}/messages` | Send a message and receive Sofia's reply |
| `GET` | `/api/chat/sessions/{session_id}/messages` | Retrieve message history |
| `POST` | `/api/chat/tts` | Convert text to speech (returns audio) |

#### Admin (JWT Protected)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/admin/login` | Admin login — returns JWT access token |
| `GET` | `/api/admin/menu` | List all menu items (admin view) |
| `POST` | `/api/admin/menu` | Create a menu item |
| `PUT` | `/api/admin/menu/{item_id}` | Update a menu item |
| `DELETE` | `/api/admin/menu/{item_id}` | Delete a menu item |
| `GET` | `/api/admin/reservations` | List all reservations |
| `PATCH` | `/api/admin/reservations/{id}` | Update reservation status |

#### Restaurant

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/restaurant` | Restaurant info (hours, location, about, contact) |

---

### Database Models

| Model | Description |
|---|---|
| `AdminUser` | Admin credentials (hashed password) |
| `MenuItem` | Menu items with name, description, price, category, dietary tags (JSON) |
| `WinePairing` | Many-to-many dish-wine pairing suggestions |
| `RestaurantTable` | Physical tables with capacity |
| `Reservation` | Guest reservations linked to a table, with confirmation code |
| `ChatSession` | Chat sessions identified by session ID |
| `ChatMessage` | Individual messages (role: user / assistant / tool) |
| `RestaurantConfig` | Key-value store for dynamic restaurant settings |

---

### AI Chatbot — Sofia

Sofia is an AI assistant built on **OpenAI GPT-4o with function calling**. She is warm, knowledgeable about the menu, and can take actions on behalf of guests.

**Available functions Sofia can invoke:**

| Function | Description |
|---|---|
| `get_menu` | Retrieve full menu, optionally filtered by category |
| `get_daily_specials` | Get today's featured dishes |
| `recommend_wine` | Suggest wine pairings for a dish |
| `check_availability` | Check available reservation slots for a date and party size |
| `make_reservation` | Create a reservation on behalf of the guest |
| `cancel_reservation` | Cancel a reservation by confirmation code |
| `get_restaurant_info` | Retrieve hours, location, and other restaurant details |

Sofia's personality is defined in `backend/app/prompts/sofia_system.txt`. She communicates in English and German, maintains a warm tone, and sprinkles in Italian phrases.

---

### Authentication

Admin routes are protected with **JWT Bearer tokens**.

1. `POST /api/admin/login` with valid credentials returns an access token.
2. Include the token in subsequent requests: `Authorization: Bearer <token>`.
3. Tokens are verified on every admin route via the `get_current_admin` dependency.

Password hashing uses **bcrypt**.

---

### Seeded Data

On first startup, the database is automatically seeded with:

- **Admin user:** `admin@mamis.com` / `admin123`
- **8 restaurant tables** with capacities from 2 to 10 guests
- **Menu items** across starters, mains, desserts, and wines, with dietary tags
- **Wine pairings** linking wines to recommended dishes
- **Restaurant config** including opening hours, address, contact, and booking settings

---

## Frontend

### Pages

| Route | Page | Description |
|---|---|---|
| `/` | `Home.tsx` | Hero section, philosophy, features, photo gallery, testimonials, CTA |
| `/menu` | `MenuPage.tsx` | Full menu with category tabs and dietary tag filters |
| `/reserve` | `Reserve.tsx` | Multi-step reservation: date & party size → time slot → guest details → confirmation |
| `/about` | `About.tsx` | Restaurant story, values, team section, timeline |
| `/contact` | `Contact.tsx` | Contact form, address, opening hours, map placeholder |

### Components

#### Layout

- **`Layout.tsx`** — Wraps every page with the header, footer, and the floating chat widget.
- **`Header.tsx`** — Responsive navigation bar with a mobile hamburger menu.
- **`Footer.tsx`** — Brand info, navigation links, and contact details.

#### Chat

- **`ChatWidget.tsx`** — Floating chat bubble that expands into a full chat window. Supports text messages, quick-reply suggestions, and a toggle for voice mode. Displays Sofia's responses with typing indicators.

#### Voice

- **`VoiceOrb.tsx`** — Animated orb UI for voice interaction. Uses the browser's **Web Speech Recognition API** for speech-to-text and the backend `/api/chat/tts` endpoint for text-to-speech playback. Displays state transitions (idle → listening → processing → speaking) with visual feedback.

---

### Services & Hooks

#### `src/services/api.ts`

Centralised Axios client with request/response interceptors. Provides typed functions for all backend API calls:

- **Menu:** `getMenu`, `getSpecials`, `getMenuItem`, `getWinePairings`
- **Reservations:** `checkAvailability`, `createReservation`, `getReservation`, `cancelReservation`
- **Chat:** `createChatSession`, `sendChatMessage`, `getChatMessages`, `textToSpeech`
- **Restaurant:** `getRestaurantInfo`
- **Admin:** `adminLogin`

#### `src/hooks/useChat.ts`

React hook that manages chat state: session creation, message list, loading state, and sending messages. Used by `ChatWidget.tsx`.

---

### Styling

The application uses **Tailwind CSS v4** with a custom design theme:

| Token | Value |
|---|---|
| `wine` | Deep red — primary brand color |
| `gold` | Warm gold — accent color |
| `cream` | Off-white — background tones |
| `olive` | Muted green — secondary accent |

**Fonts:**
- **Playfair Display** — headings and display text
- **Cormorant Garamond** — elegant body text
- **Inter** — UI elements and labels

Animations are handled by **Framer Motion** for page transitions, fade-ins, and interactive element effects.

---

## Running the Application

To run both servers simultaneously:

```bash
# Terminal 1 — Backend
cd backend
venv\Scripts\activate      # Windows
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Or use the provided `Makefile`:

```bash
make dev
```

Access the app at `http://localhost:5173`.  
API docs (Swagger UI) at `http://localhost:8000/docs`.

---

## Testing

The backend uses **pytest** with **pytest-asyncio** for async test support.

```bash
cd backend
pytest
```

Test files should be placed in `backend/tests/` following the `test_*.py` naming convention.

---

## Deployment

### Backend

1. Set `DATABASE_URL` to a PostgreSQL connection string.
2. Set `DEBUG=false`.
3. Run Alembic migrations: `alembic upgrade head`.
4. Serve with a production ASGI server: `uvicorn app.main:app --host 0.0.0.0 --port 8000`.
5. Place behind a reverse proxy (nginx, Caddy) with HTTPS.

### Frontend

```bash
cd frontend
npm run build
```

The `dist/` folder contains static files that can be deployed to any static host (Vercel, Netlify, Cloudflare Pages, nginx, etc.). Make sure the production backend URL is configured in the frontend's environment or Vite config.

---

## License

Private project — MaMi's Food & Wine. All rights reserved.
