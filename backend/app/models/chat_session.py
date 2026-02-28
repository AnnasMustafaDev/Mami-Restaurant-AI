from sqlalchemy import String, Integer, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id: Mapped[str] = mapped_column(String, primary_key=True)  # UUID as text
    started_at: Mapped[str] = mapped_column(String, server_default=func.now())
    ended_at: Mapped[str | None] = mapped_column(String)
    message_count: Mapped[int] = mapped_column(Integer, default=0)
    source: Mapped[str | None] = mapped_column(String(20))  # text, voice
    reservation_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("reservations.id"))

    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")
