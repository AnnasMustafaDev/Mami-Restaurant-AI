"""LLM service — OpenAI with function calling for Sofia chatbot."""

import json
import uuid
from pathlib import Path

from openai import AsyncOpenAI
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.menu_item import MenuItem
from app.models.wine_pairing import WinePairing
from app.models.reservation import Reservation
from app.models.restaurant_table import RestaurantTable
from app.models.restaurant_config import RestaurantConfig
from app.models.chat_message import ChatMessage

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

SYSTEM_PROMPT = (Path(__file__).parent.parent / "prompts" / "sofia_system.txt").read_text()

# --- Tool definitions for OpenAI function calling ---

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_menu",
            "description": "Get menu items, optionally filtered by category or dietary preference",
            "parameters": {
                "type": "object",
                "properties": {
                    "category": {
                        "type": "string",
                        "enum": ["nebenbei", "kalt", "warm", "suess", "wine"],
                        "description": "Filter by menu category",
                    },
                    "dietary_pref": {
                        "type": "string",
                        "description": "Filter by dietary tag (e.g. vegan, vegetarian, gluten-free)",
                    },
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_daily_specials",
            "description": "Get today's special dishes",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "recommend_wine",
            "description": "Recommend wine pairings for a specific dish",
            "parameters": {
                "type": "object",
                "properties": {
                    "dish_name": {
                        "type": "string",
                        "description": "The name of the dish to find wine pairings for",
                    },
                },
                "required": ["dish_name"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "check_availability",
            "description": "Check if tables are available for a given date, time, and party size",
            "parameters": {
                "type": "object",
                "properties": {
                    "date": {"type": "string", "description": "Date in YYYY-MM-DD format"},
                    "time": {"type": "string", "description": "Time in HH:MM format"},
                    "guests": {"type": "integer", "description": "Number of guests"},
                },
                "required": ["date", "time", "guests"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "make_reservation",
            "description": "Book a table. Only call this after confirming all details with the guest.",
            "parameters": {
                "type": "object",
                "properties": {
                    "guest_name": {"type": "string", "description": "Guest's full name"},
                    "date": {"type": "string", "description": "Date in YYYY-MM-DD format"},
                    "time": {"type": "string", "description": "Time in HH:MM format"},
                    "guests": {"type": "integer", "description": "Number of guests"},
                    "guest_email": {"type": "string", "description": "Guest's email (optional)"},
                    "guest_phone": {"type": "string", "description": "Guest's phone (optional)"},
                    "special_requests": {"type": "string", "description": "Any special requests"},
                },
                "required": ["guest_name", "date", "time", "guests"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "cancel_reservation",
            "description": "Cancel a reservation by booking reference code",
            "parameters": {
                "type": "object",
                "properties": {
                    "booking_ref": {"type": "string", "description": "The booking reference (e.g. MM-XXXXXXXX)"},
                },
                "required": ["booking_ref"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_restaurant_info",
            "description": "Get restaurant information like hours, location, or about/story",
            "parameters": {
                "type": "object",
                "properties": {
                    "topic": {
                        "type": "string",
                        "enum": ["hours", "location", "about", "booking_settings"],
                        "description": "What info to retrieve",
                    },
                },
                "required": ["topic"],
            },
        },
    },
]


# --- Tool execution functions ---


async def _exec_get_menu(db: AsyncSession, args: dict) -> str:
    query = select(MenuItem).where(MenuItem.is_available == 1)
    if args.get("category"):
        query = query.where(MenuItem.category == args["category"])
    query = query.order_by(MenuItem.category, MenuItem.name)
    result = await db.execute(query)
    items = result.scalars().all()

    if args.get("dietary_pref"):
        pref = args["dietary_pref"].lower()
        items = [i for i in items if i.dietary_tags and pref in i.dietary_tags.lower()]

    if not items:
        return "No items found matching that criteria."

    lines = []
    for item in items:
        tags = ""
        if item.dietary_tags:
            try:
                tag_list = json.loads(item.dietary_tags)
                if tag_list:
                    tags = f" ({', '.join(tag_list)})"
            except json.JSONDecodeError:
                pass
        special = " [TODAY'S SPECIAL]" if item.is_special else ""
        lines.append(f"- {item.name}: €{item.price:.2f}{tags}{special}\n  {item.description or ''}")
    return "\n".join(lines)


async def _exec_get_daily_specials(db: AsyncSession, args: dict) -> str:
    query = select(MenuItem).where(MenuItem.is_special == 1, MenuItem.is_available == 1)
    result = await db.execute(query)
    items = result.scalars().all()
    if not items:
        return "No specials today."
    lines = []
    for item in items:
        lines.append(f"- {item.name}: €{item.price:.2f}\n  {item.description or ''}")
    return "\n".join(lines)


async def _exec_recommend_wine(db: AsyncSession, args: dict) -> str:
    dish_name = args["dish_name"]
    # Find the dish by name (fuzzy match)
    query = select(MenuItem).where(MenuItem.is_available == 1)
    result = await db.execute(query)
    all_items = result.scalars().all()

    dish = None
    for item in all_items:
        if dish_name.lower() in item.name.lower():
            dish = item
            break

    if not dish:
        return f"I couldn't find a dish called '{dish_name}' on our menu. Could you try again with the exact dish name?"

    # Get wine pairings
    pairing_query = (
        select(WinePairing, MenuItem)
        .join(MenuItem, WinePairing.wine_id == MenuItem.id)
        .where(WinePairing.dish_id == dish.id)
    )
    result = await db.execute(pairing_query)
    pairings = result.all()

    if not pairings:
        return f"We don't have specific wine pairings for {dish.name} yet, but I'd be happy to suggest something based on the flavors!"

    lines = [f"Wine pairings for {dish.name}:"]
    for pairing, wine in pairings:
        lines.append(f"- {wine.name} (€{wine.price:.2f}): {pairing.notes or ''}")
    return "\n".join(lines)


async def _exec_check_availability(db: AsyncSession, args: dict) -> str:
    date, time, guests = args["date"], args["time"], args["guests"]

    suitable = select(RestaurantTable).where(
        RestaurantTable.capacity >= guests, RestaurantTable.is_active == 1
    )
    result = await db.execute(suitable)
    all_suitable = result.scalars().all()

    if not all_suitable:
        return f"Sorry, we don't have tables that can accommodate {guests} guests."

    booked_ids_q = select(Reservation.table_id).where(
        Reservation.date == date,
        Reservation.time_slot == time,
        Reservation.status != "cancelled",
        Reservation.table_id.isnot(None),
    )
    booked_result = await db.execute(booked_ids_q)
    booked_ids = {row[0] for row in booked_result.all()}

    available = [t for t in all_suitable if t.id not in booked_ids]
    if available:
        return f"Yes! We have {len(available)} table(s) available for {guests} guests at {time} on {date}."
    return f"Sorry, no tables available for {guests} guests at {time} on {date}. Would you like to try a different time?"


async def _exec_make_reservation(db: AsyncSession, args: dict) -> str:
    date = args["date"]
    time = args["time"]
    guests = args["guests"]
    guest_name = args["guest_name"]

    # Find available table
    booked_ids_q = select(Reservation.table_id).where(
        Reservation.date == date,
        Reservation.time_slot == time,
        Reservation.status != "cancelled",
        Reservation.table_id.isnot(None),
    )
    booked_result = await db.execute(booked_ids_q)
    booked_ids = {row[0] for row in booked_result.all()}

    suitable = select(RestaurantTable).where(
        RestaurantTable.capacity >= guests, RestaurantTable.is_active == 1
    ).order_by(RestaurantTable.capacity)
    result = await db.execute(suitable)
    all_suitable = result.scalars().all()

    table = next((t for t in all_suitable if t.id not in booked_ids), None)
    if not table:
        return f"Sorry, no tables available for {guests} guests at {time} on {date}."

    booking_ref = f"MM-{uuid.uuid4().hex[:8].upper()}"
    reservation = Reservation(
        booking_ref=booking_ref,
        guest_name=guest_name,
        guest_email=args.get("guest_email"),
        guest_phone=args.get("guest_phone"),
        party_size=guests,
        date=date,
        time_slot=time,
        table_id=table.id,
        special_requests=args.get("special_requests"),
        source="chat",
    )
    db.add(reservation)
    await db.commit()

    return f"Reservation confirmed! Booking ref: {booking_ref}. {guest_name}, party of {guests}, on {date} at {time}. Table {table.table_number}."


async def _exec_cancel_reservation(db: AsyncSession, args: dict) -> str:
    booking_ref = args["booking_ref"].strip().upper()
    query = select(Reservation).where(Reservation.booking_ref == booking_ref)
    result = await db.execute(query)
    reservation = result.scalar_one_or_none()

    if not reservation:
        return f"I couldn't find a reservation with reference '{booking_ref}'. Please double-check the code."
    if reservation.status == "cancelled":
        return "That reservation has already been cancelled."

    reservation.status = "cancelled"
    await db.commit()
    return f"Reservation {booking_ref} for {reservation.guest_name} on {reservation.date} at {reservation.time_slot} has been cancelled."


async def _exec_get_restaurant_info(db: AsyncSession, args: dict) -> str:
    topic = args["topic"]
    query = select(RestaurantConfig).where(RestaurantConfig.key == topic)
    result = await db.execute(query)
    config = result.scalar_one_or_none()
    if not config:
        return f"No info found for '{topic}'."
    try:
        data = json.loads(config.value)
        return json.dumps(data, indent=2)
    except json.JSONDecodeError:
        return config.value


TOOL_HANDLERS = {
    "get_menu": _exec_get_menu,
    "get_daily_specials": _exec_get_daily_specials,
    "recommend_wine": _exec_recommend_wine,
    "check_availability": _exec_check_availability,
    "make_reservation": _exec_make_reservation,
    "cancel_reservation": _exec_cancel_reservation,
    "get_restaurant_info": _exec_get_restaurant_info,
}


# --- Main chat function ---


async def chat_with_sofia(
    session_id: str,
    user_message: str,
    db: AsyncSession,
) -> str:
    """Send a message to Sofia and get a response, with tool calling support."""

    # Load conversation history from DB
    history_query = (
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
    )
    result = await db.execute(history_query)
    history = result.scalars().all()

    # Build messages array
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in history:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": user_message})

    # Call OpenAI with tools
    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        tools=TOOLS,
        tool_choice="auto",
    )

    assistant_msg = response.choices[0].message

    # Handle tool calls (may need multiple rounds)
    max_rounds = 5
    rounds = 0
    while assistant_msg.tool_calls and rounds < max_rounds:
        rounds += 1
        # Add assistant message with tool calls to context
        messages.append(assistant_msg.model_dump())

        # Execute each tool call
        for tool_call in assistant_msg.tool_calls:
            fn_name = tool_call.function.name
            fn_args = json.loads(tool_call.function.arguments)

            handler = TOOL_HANDLERS.get(fn_name)
            if handler:
                tool_result = await handler(db, fn_args)
            else:
                tool_result = f"Unknown tool: {fn_name}"

            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": tool_result,
            })

        # Call OpenAI again with tool results
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
        )
        assistant_msg = response.choices[0].message

    return assistant_msg.content or "I'm sorry, I couldn't process that. Could you try again?"
