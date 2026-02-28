import json

from sqlalchemy import String, Integer, Float, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class MenuItem(Base):
    __tablename__ = "menu_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str | None] = mapped_column(String(50))  # starter, main, dessert, wine
    price: Mapped[float] = mapped_column(Float, nullable=False)
    dietary_tags: Mapped[str | None] = mapped_column(Text)  # JSON array: '["vegan","gluten-free"]'
    image_url: Mapped[str | None] = mapped_column(String(500))
    is_available: Mapped[int] = mapped_column(Integer, default=1)
    is_special: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[str] = mapped_column(String, server_default=func.now())

    # Relationships
    wine_pairings_as_dish = relationship(
        "WinePairing", foreign_keys="WinePairing.dish_id", back_populates="dish"
    )
    wine_pairings_as_wine = relationship(
        "WinePairing", foreign_keys="WinePairing.wine_id", back_populates="wine"
    )

    @property
    def dietary_tags_list(self) -> list[str]:
        if not self.dietary_tags:
            return []
        return json.loads(self.dietary_tags)

    @dietary_tags_list.setter
    def dietary_tags_list(self, value: list[str]):
        self.dietary_tags = json.dumps(value)
