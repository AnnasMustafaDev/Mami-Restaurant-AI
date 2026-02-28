from sqlalchemy import String, Integer, Text, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Reservation(Base):
    __tablename__ = "reservations"
    __table_args__ = (UniqueConstraint("table_id", "date", "time_slot"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    booking_ref: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    guest_name: Mapped[str] = mapped_column(String(200), nullable=False)
    guest_email: Mapped[str | None] = mapped_column(String(200))
    guest_phone: Mapped[str | None] = mapped_column(String(30))
    party_size: Mapped[int] = mapped_column(Integer, nullable=False)
    date: Mapped[str] = mapped_column(String, nullable=False)  # 'YYYY-MM-DD'
    time_slot: Mapped[str] = mapped_column(String, nullable=False)  # 'HH:MM'
    table_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("restaurant_tables.id"))
    special_requests: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="confirmed")
    source: Mapped[str] = mapped_column(String(20), default="web")
    created_at: Mapped[str] = mapped_column(String, server_default=func.now())

    table = relationship("RestaurantTable", back_populates="reservations")
