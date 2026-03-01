---
name: LiveKit Voice AI Sofia
overview: Replace the current browser Web Speech API + REST TTS voice mode with a proper LiveKit WebRTC real-time voice pipeline. A Python LiveKit Agent handles STT→LLM→TTS server-side; the frontend connects to a LiveKit room and streams audio bidirectionally.
todos:
  - id: deps-backend
    content: Add livekit-agents and livekit-plugins-openai to backend/requirements.txt and install them
    status: completed
  - id: voice-service
    content: Create backend/app/services/voice_service.py with LiveKit AccessToken generation
    status: completed
  - id: voice-agent
    content: Create backend/app/agents/voice_agent.py with SofiaVoiceAgent (STT→LLM→TTS pipeline)
    status: completed
  - id: voice-worker
    content: Create backend/voice_worker.py as the standalone agent worker entry point
    status: completed
  - id: token-endpoint
    content: Add POST /chat/voice-token endpoint to backend/app/api/routes/chat.py
    status: completed
  - id: deps-frontend
    content: Install livekit-client and @livekit/components-react in frontend
    status: completed
  - id: api-service
    content: Add getVoiceToken() to frontend/src/services/api.ts
    status: completed
  - id: voice-orb
    content: Rewrite frontend/src/components/voice/VoiceOrb.tsx to use LiveKit Room instead of Web Speech API
    status: completed
isProject: false
---

# LiveKit Voice AI — Sofia

## Current State vs Target

**Current:** `SpeechRecognition` (browser) → REST `/chat/messages` → REST `/chat/tts` → `Audio()` playback

**Target:** WebRTC room → LiveKit Agent (server-side STT → GPT-4o → OpenAI TTS) → audio back to browser

This is faster (no round-trip text encoding), more robust (handles interruptions, turn detection), and works even where browser `SpeechRecognition` is blocked.

## Architecture

```mermaid
flowchart LR
    subgraph browser [Browser]
        VoiceOrb["VoiceOrb\n(livekit-client)"]
    end

    subgraph fastapi [FastAPI Process]
        token["POST /api/chat/voice-token"]
    end

    subgraph worker [Agent Worker Process]
        agent["voice_agent.py\n(SofiaVoiceAgent)"]
        stt["OpenAI Whisper STT"]
        llm["GPT-4o + tools\n(llm_service.py)"]
        tts["OpenAI TTS nova"]
    end

    subgraph livekit [LiveKit Cloud]
        room["Room"]
    end

    VoiceOrb -->|"1 - GET token"| token
    token -->|"2 - JWT + room name"| VoiceOrb
    VoiceOrb -->|"3 - connect WebRTC"| room
    agent -->|"4 - worker joins"| room
    room -->|"5 - mic audio"| stt
    stt -->|text| llm
    llm -->|response| tts
    tts -->|"6 - audio track"| room
    room -->|"7 - plays back"| VoiceOrb
```



## Stack — No New API Keys Needed

- STT: `livekit-plugins-openai` (Whisper) — uses existing `OPENAI_API_KEY`
- LLM: GPT-4o with existing `sofia_system.txt` + tool functions
- TTS: `livekit-plugins-openai` (TTS nova) — uses existing `OPENAI_API_KEY`
- Transport: LiveKit Cloud — uses existing `LIVEKIT_*` env vars

## Files Changed

**Backend — 5 files:**

- `[backend/requirements.txt](backend/requirements.txt)` — add `livekit-agents`, `livekit-plugins-openai`
- `[backend/app/agents/voice_agent.py](backend/app/agents/voice_agent.py)` (**NEW**) — `SofiaVoiceAgent` class: wires OpenAI STT + GPT-4o + OpenAI TTS, reuses `sofia_system.txt` prompt and the tool-calling logic from `llm_service.py`
- `[backend/app/services/voice_service.py](backend/app/services/voice_service.py)` (**NEW**) — `create_voice_token(session_id)` using `livekit-api` `AccessToken`
- `[backend/app/api/routes/chat.py](backend/app/api/routes/chat.py)` — add `POST /chat/voice-token` endpoint (returns `{ token, url, room_name }`)
- `[backend/voice_worker.py](backend/voice_worker.py)` (**NEW**) — standalone entry point: `python voice_worker.py dev` runs the agent worker, separate from the FastAPI process

**Frontend — 3 files:**

- `[frontend/package.json](frontend/package.json)` — add `livekit-client`, `@livekit/components-react`
- `[frontend/src/services/api.ts](frontend/src/services/api.ts)` — add `getVoiceToken(sessionId)`
- `[frontend/src/components/voice/VoiceOrb.tsx](frontend/src/components/voice/VoiceOrb.tsx)` — replace `SpeechRecognition` + `Audio()` with `Room` from `livekit-client`; use `useVoiceAssistant()` hook for state; keep existing 4-state UI (`idle/listening/thinking/speaking`) wired to LiveKit agent state

## VoiceOrb state mapping


| LiveKit agent state | Sofia expression | Orb UI           |
| ------------------- | ---------------- | ---------------- |
| `disconnected`      | `idle`           | static orb       |
| `connecting`        | `thinking`       | slow pulse       |
| `listening`         | `listening`      | fast green rings |
| `thinking`          | `thinking`       | dots animate     |
| `speaking`          | `speaking`       | waveform bars    |


## Dev Setup (after implementation)

Two terminals:

```bash
# Terminal 1 — FastAPI
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 2 — Voice Agent Worker
cd backend && python voice_worker.py dev
```

The agent worker connects to LiveKit Cloud and waits for rooms. When a user starts voice chat, the frontend calls `/voice-token`, gets a JWT, connects to the room, and the worker dispatches a `SofiaVoiceAgent` into that room automatically.