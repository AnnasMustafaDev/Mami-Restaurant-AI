import json

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.menu_item import MenuItem
from app.models.wine_pairing import WinePairing
from app.schemas.menu import (
    MenuItemCreate,
    MenuItemResponse,
    MenuItemUpdate,
    WinePairingResponse,
)

router = APIRouter(prefix="/menu", tags=["menu"])


@router.get("", response_model=list[MenuItemResponse])
async def get_menu(
    category: str | None = Query(None, description="Filter by category"),
    available_only: bool = Query(True, description="Only show available items"),
    db: AsyncSession = Depends(get_db),
):
    """Get full menu, optionally filtered by category."""
    query = select(MenuItem)
    if category:
        query = query.where(MenuItem.category == category)
    if available_only:
        query = query.where(MenuItem.is_available == 1)
    query = query.order_by(MenuItem.category, MenuItem.name)

    result = await db.execute(query)
    items = result.scalars().all()

    return [_to_response(item) for item in items]


@router.get("/specials", response_model=list[MenuItemResponse])
async def get_specials(db: AsyncSession = Depends(get_db)):
    """Get today's special items."""
    query = select(MenuItem).where(MenuItem.is_special == 1, MenuItem.is_available == 1)
    result = await db.execute(query)
    items = result.scalars().all()
    return [_to_response(item) for item in items]


@router.get("/{item_id}", response_model=MenuItemResponse)
async def get_menu_item(item_id: int, db: AsyncSession = Depends(get_db)):
    """Get a single menu item by ID, including wine pairings."""
    item = await db.get(MenuItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return _to_response(item)


@router.get("/{item_id}/pairings", response_model=list[WinePairingResponse])
async def get_wine_pairings(item_id: int, db: AsyncSession = Depends(get_db)):
    """Get wine pairings for a dish."""
    query = (
        select(WinePairing, MenuItem)
        .join(MenuItem, WinePairing.wine_id == MenuItem.id)
        .where(WinePairing.dish_id == item_id)
    )
    result = await db.execute(query)
    rows = result.all()
    return [
        WinePairingResponse(wine_id=pairing.wine_id, wine_name=wine.name, notes=pairing.notes)
        for pairing, wine in rows
    ]


def _to_response(item: MenuItem) -> MenuItemResponse:
    """Convert ORM model to response, parsing JSON dietary_tags."""
    tags = []
    if item.dietary_tags:
        try:
            tags = json.loads(item.dietary_tags)
        except json.JSONDecodeError:
            tags = []

    return MenuItemResponse(
        id=item.id,
        name=item.name,
        description=item.description,
        category=item.category,
        price=item.price,
        dietary_tags=tags,
        image_url=item.image_url,
        is_available=bool(item.is_available),
        is_special=bool(item.is_special),
        created_at=item.created_at,
    )
