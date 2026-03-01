"""LiveKit Voice Agent worker — run as a separate process alongside FastAPI.

Usage:
    # development (hot-reload, verbose logging)
    python voice_worker.py dev

    # production
    python voice_worker.py start

Requires LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and OPENAI_API_KEY
to be set in backend/.env (loaded automatically).
"""

from pathlib import Path

# Load .env before any app imports so Settings() picks them up
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")

from livekit.agents import WorkerOptions, cli  # noqa: E402

from app.agents.voice_agent import entrypoint  # noqa: E402
from app.core.config import settings  # noqa: E402

if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            agent_name="sofia",
            api_key=settings.LIVEKIT_API_KEY,
            api_secret=settings.LIVEKIT_API_SECRET,
            ws_url=settings.LIVEKIT_URL,
        )
    )
