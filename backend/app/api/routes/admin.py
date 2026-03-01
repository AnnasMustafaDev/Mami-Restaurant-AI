import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.models.admin_user import AdminUser
from app.models.chat_message import ChatMessage
from app.models.chat_session import ChatSession
from app.models.menu_item import MenuItem
from app.models.reservation import Reservation
from app.models.restaurant_config import RestaurantConfig
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.chat import ChatMessageResponse, ChatSessionResponse
from app.schemas.menu import MenuItemCreate, MenuItemResponse, MenuItemUpdate
from app.schemas.reservation import ReservationResponse

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/login", response_model=TokenResponse)
async def admin_login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate admin and return JWT token."""
    query = select(AdminUser).where(AdminUser.email == data.email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.email, "role": user.role})
    return TokenResponse(access_token=token)


# --- Menu Management (protected) ---


@router.post("/menu", response_model=MenuItemResponse, dependencies=[Depends(get_current_admin)])
async def create_menu_item(data: MenuItemCreate, db: AsyncSession = Depends(get_db)):
    """Create a new menu item."""
    item = MenuItem(
        name=data.name,
        description=data.description,
        category=data.category,
        price=data.price,
        dietary_tags=json.dumps(data.dietary_tags) if data.dietary_tags else None,
        image_url=data.image_url,
        is_available=int(data.is_available),
        is_special=int(data.is_special),
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)

    return MenuItemResponse(
        id=item.id,
        name=item.name,
        description=item.description,
        category=item.category,
        price=item.price,
        dietary_tags=data.dietary_tags,
        image_url=item.image_url,
        is_available=bool(item.is_available),
        is_special=bool(item.is_special),
        created_at=item.created_at,
    )


@router.put("/menu/{item_id}", response_model=MenuItemResponse, dependencies=[Depends(get_current_admin)])
async def update_menu_item(
    item_id: int,
    data: MenuItemUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a menu item."""
    item = await db.get(MenuItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    update_data = data.model_dump(exclude_unset=True)
    if "dietary_tags" in update_data:
        update_data["dietary_tags"] = json.dumps(update_data["dietary_tags"])
    if "is_available" in update_data:
        update_data["is_available"] = int(update_data["is_available"])
    if "is_special" in update_data:
        update_data["is_special"] = int(update_data["is_special"])

    for field, value in update_data.items():
        setattr(item, field, value)

    await db.commit()
    await db.refresh(item)

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


@router.delete("/menu/{item_id}", dependencies=[Depends(get_current_admin)])
async def delete_menu_item(item_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a menu item."""
    item = await db.get(MenuItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    await db.delete(item)
    await db.commit()
    return {"detail": "Menu item deleted"}


# --- Reservation Management (protected) ---


@router.get("/reservations", response_model=list[ReservationResponse], dependencies=[Depends(get_current_admin)])
async def list_reservations(
    status: str | None = None,
    date: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    """List all reservations, optionally filtered."""
    query = select(Reservation).order_by(Reservation.date.desc(), Reservation.time_slot)
    if status:
        query = query.where(Reservation.status == status)
    if date:
        query = query.where(Reservation.date == date)

    result = await db.execute(query)
    return result.scalars().all()


@router.patch("/reservations/{reservation_id}", response_model=ReservationResponse, dependencies=[Depends(get_current_admin)])
async def update_reservation_status(
    reservation_id: int,
    status: str,
    db: AsyncSession = Depends(get_db),
):
    """Update reservation status."""
    reservation = await db.get(Reservation, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    if status not in ("confirmed", "cancelled", "completed"):
        raise HTTPException(status_code=400, detail="Invalid status")

    reservation.status = status
    await db.commit()
    await db.refresh(reservation)
    return reservation


# --- Chat Session Management (protected) ---


@router.get("/chat-sessions", response_model=list[ChatSessionResponse], dependencies=[Depends(get_current_admin)])
async def list_chat_sessions(
    source: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    min_messages: int | None = None,
    db: AsyncSession = Depends(get_db),
):
    """List all chat sessions with optional filters: source, date range, min message count."""
    query = select(ChatSession).order_by(ChatSession.started_at.desc())
    if source:
        query = query.where(ChatSession.source == source)
    if date_from:
        query = query.where(ChatSession.started_at >= date_from)
    if date_to:
        # Add T23:59:59 so the to-date is inclusive
        query = query.where(ChatSession.started_at <= f"{date_to}T23:59:59")
    if min_messages is not None:
        query = query.where(ChatSession.message_count >= min_messages)
    result = await db.execute(query)
    return result.scalars().all()


@router.delete("/chat-sessions/{session_id}", dependencies=[Depends(get_current_admin)])
async def delete_chat_session(session_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a chat session and all its messages (cascade)."""
    session = await db.get(ChatSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    await db.delete(session)
    await db.commit()
    return {"detail": "Chat session deleted"}


@router.get("/chat-sessions/{session_id}/messages", response_model=list[ChatMessageResponse], dependencies=[Depends(get_current_admin)])
async def get_admin_chat_messages(
    session_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get all messages in a chat session (admin view)."""
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


@router.get("/reservations/{reservation_id}/chat-sessions", response_model=list[ChatSessionResponse], dependencies=[Depends(get_current_admin)])
async def get_reservation_chat_sessions(
    reservation_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get chat sessions linked to a reservation."""
    query = (
        select(ChatSession)
        .where(ChatSession.reservation_id == reservation_id)
        .order_by(ChatSession.started_at.desc())
    )
    result = await db.execute(query)
    return result.scalars().all()


# --- Restaurant Config Management (protected) ---


_CONFIG_DEFAULTS: dict[str, object] = {
    "contact": {
        "address_lines": [""],
        "phone": "",
        "email": "",
        "hours": [""],
        "map_address": "",
    },
    "about": {},
    "booking_settings": {},
}


@router.get("/config/{key}", dependencies=[Depends(get_current_admin)])
async def get_config(key: str, db: AsyncSession = Depends(get_db)):
    """Get a specific restaurant config value. Returns an empty default when key not yet set."""
    config = await db.get(RestaurantConfig, key)
    if not config:
        return {"key": key, "value": _CONFIG_DEFAULTS.get(key, {})}
    try:
        return {"key": config.key, "value": json.loads(config.value)}
    except json.JSONDecodeError:
        return {"key": config.key, "value": config.value}


@router.put("/config/{key}", dependencies=[Depends(get_current_admin)])
async def update_config(key: str, data: dict, db: AsyncSession = Depends(get_db)):
    """Update (upsert) a restaurant config value."""
    value = data.get("value")
    if value is None:
        raise HTTPException(status_code=400, detail="Missing 'value' field")

    serialized = json.dumps(value) if not isinstance(value, str) else value

    config = await db.get(RestaurantConfig, key)
    if config:
        config.value = serialized
    else:
        config = RestaurantConfig(key=key, value=serialized)
        db.add(config)

    await db.commit()
    await db.refresh(config)
    try:
        return {"key": config.key, "value": json.loads(config.value)}
    except json.JSONDecodeError:
        return {"key": config.key, "value": config.value}
