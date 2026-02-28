"""Shared fixtures for tests — in-memory SQLite, test client, OpenAI mocks."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.database import Base, get_db
from app.main import app
from app.services.seed import seed_database


# Use a fresh in-memory SQLite for every test session
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestSession = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_db():
    """Create all tables and seed once for the test session."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with TestSession() as db:
        await seed_database(db)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db():
    """Provide a transactional DB session that rolls back after each test."""
    async with TestSession() as session:
        yield session


async def _override_get_db():
    async with TestSession() as session:
        try:
            yield session
        finally:
            await session.close()


@pytest_asyncio.fixture
async def client():
    """Async HTTP test client with DB dependency override."""
    app.dependency_overrides[get_db] = _override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


# --- OpenAI mocks ---


def _make_mock_chat_response(content: str, tool_calls=None):
    """Build a mock that looks like an OpenAI ChatCompletion response."""
    msg = MagicMock()
    msg.content = content
    msg.tool_calls = tool_calls
    msg.model_dump = MagicMock(return_value={
        "role": "assistant",
        "content": content,
        "tool_calls": tool_calls,
    })
    choice = MagicMock()
    choice.message = msg
    resp = MagicMock()
    resp.choices = [choice]
    return resp


@pytest.fixture
def mock_openai_chat():
    """Patch OpenAI chat completions so no real API call is made."""
    mock_response = _make_mock_chat_response("Buonasera! Welcome to MaMi's. How can I help you?")
    with patch("app.services.llm_service.client") as mock_client:
        mock_client.chat.completions.create = AsyncMock(return_value=mock_response)
        yield mock_client


@pytest.fixture
def mock_openai_tts():
    """Patch OpenAI TTS so no real API call is made."""
    fake_audio = b"\xff\xfb\x90\x00" + b"\x00" * 100  # fake mp3 bytes
    mock_resp = MagicMock()

    async def _aiter_bytes():
        yield fake_audio

    mock_resp.response.aiter_bytes = _aiter_bytes

    with patch("app.api.routes.chat.tts_client") as mock_tts:
        mock_tts.audio.speech.create = AsyncMock(return_value=mock_resp)
        yield mock_tts
