import uuid

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from openai import AsyncOpenAI
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models.chat_session import ChatSession
from app.models.chat_message import ChatMessage
from app.schemas.chat import (
    ChatMessageCreate,
    ChatMessageResponse,
    ChatSessionCreate,
    ChatSessionResponse,
)
from app.services.llm_service import chat_with_sofia
from app.services.voice_service import create_voice_token

tts_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/sessions", response_model=ChatSessionResponse, status_code=201)
async def create_session(
    data: ChatSessionCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new chat session."""
    session = ChatSession(
        id=str(uuid.uuid4()),
        source=data.source,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse)
async def send_message(
    session_id: str,
    data: ChatMessageCreate,
    db: AsyncSession = Depends(get_db),
):
    """Send a message in a chat session and get AI response from Sofia."""
    # Verify session exists
    session = await db.get(ChatSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    # Save user message
    user_msg = ChatMessage(
        session_id=session_id,
        role="user",
        content=data.content,
    )
    db.add(user_msg)
    await db.flush()

    # Call LLM
    assistant_content = await chat_with_sofia(session_id, data.content, db)

    # Save assistant message
    assistant_msg = ChatMessage(
        session_id=session_id,
        role="assistant",
        content=assistant_content,
    )
    db.add(assistant_msg)

    # Update session message count
    session.message_count = (session.message_count or 0) + 2
    await db.commit()
    await db.refresh(assistant_msg)

    return assistant_msg


@router.get("/sessions/{session_id}/messages", response_model=list[ChatMessageResponse])
async def get_session_messages(
    session_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get all messages in a chat session."""
    session = await db.get(ChatSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    query = (
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    )
    result = await db.execute(query)
    return result.scalars().all()


class VoiceTokenRequest(BaseModel):
    session_id: str | None = None


@router.post("/voice-token")
async def get_voice_token(
    data: VoiceTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create a LiveKit room token for a voice session.

    If session_id is provided, the token is tied to that existing chat session.
    Otherwise a new voice session is created automatically.
    """
    session_id = data.session_id

    if not session_id:
        session = ChatSession(id=str(uuid.uuid4()), source="voice")
        db.add(session)
        await db.commit()
        session_id = session.id
    else:
        existing = await db.get(ChatSession, session_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Session not found")

    token, room_name = create_voice_token(session_id)

    return {
        "token": token,
        "url": settings.LIVEKIT_URL,
        "room_name": room_name,
        "session_id": session_id,
    }


class TTSRequest(BaseModel):
    text: str
    voice: str = "nova"  # nova = warm female voice


@router.post("/tts")
async def text_to_speech(data: TTSRequest):
    """Convert text to speech using OpenAI TTS. Returns audio/mpeg stream."""
    response = await tts_client.audio.speech.create(
        model="tts-1",
        voice=data.voice,
        input=data.text,
    )

    async def audio_stream():
        async for chunk in response.response.aiter_bytes():
            yield chunk

    return StreamingResponse(audio_stream(), media_type="audio/mpeg")
