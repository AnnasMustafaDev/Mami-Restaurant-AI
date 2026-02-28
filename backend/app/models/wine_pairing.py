from sqlalchemy import Integer, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class WinePairing(Base):
    __tablename__ = "wine_pairings"
    __table_args__ = (UniqueConstraint("dish_id", "wine_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    dish_id: Mapped[int] = mapped_column(Integer, ForeignKey("menu_items.id", ondelete="CASCADE"), nullable=False)
    wine_id: Mapped[int] = mapped_column(Integer, ForeignKey("menu_items.id", ondelete="CASCADE"), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)

    dish = relationship("MenuItem", foreign_keys=[dish_id], back_populates="wine_pairings_as_dish")
    wine = relationship("MenuItem", foreign_keys=[wine_id], back_populates="wine_pairings_as_wine")
