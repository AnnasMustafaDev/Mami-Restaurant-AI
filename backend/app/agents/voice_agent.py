"""Sofia Voice Agent — LiveKit Agents pipeline (STT → LLM → TTS).

Runs as a separate worker process via voice_worker.py.
"""

import json
import logging
import time
import uuid
from pathlib import Path
from typing import Annotated

from livekit.agents import Agent, AgentSession, JobContext, function_tool
from livekit.plugins import openai as lk_openai, silero
from sqlalchemy import select

logger = logging.getLogger(__name__)

from app.core.config import settings
from app.core.database import async_session
from app.models.menu_item import MenuItem
from app.models.reservation import Reservation
from app.models.restaurant_config import RestaurantConfig
from app.models.restaurant_table import RestaurantTable
from app.models.wine_pairing import WinePairing

SYSTEM_PROMPT = (
    Path(__file__).parent.parent / "prompts" / "sofia_system.txt"
).read_text(encoding="utf-8")

# Voice-specific addendum — keep responses short for spoken delivery
VOICE_ADDENDUM = """
<voice_mode>
You are responding via voice — keep every reply under 3 sentences.
Do NOT use markdown, bullet points, asterisks, or lists in your responses.
Speak naturally as if talking to a guest face-to-face.
IMPORTANT: Always detect the language the guest is speaking and reply in EXACTLY that language.
If the guest speaks German, respond in German. If French, respond in French. If Italian, respond in Italian.
Never switch languages unless the guest does first.
</voice_mode>
"""


class SofiaVoiceAgent(Agent):
    """Sofia's voice personality — same tools as the text chatbot, voice-optimised responses."""

    def __init__(self) -> None:
        super().__init__(instructions=SYSTEM_PROMPT + VOICE_ADDENDUM)

    # ── Menu tools ────────────────────────────────────────────────────────────

    @function_tool
    async def get_menu(
        self,
        category: Annotated[
            str | None,
            "Category to filter: nebenbei, kalt, warm, suess, wine",
        ] = None,
        dietary_pref: Annotated[
            str | None,
            "Dietary filter: vegan, vegetarian, gluten-free",
        ] = None,
    ) -> str:
        """Get menu items from MaMi's restaurant."""
        async with async_session() as db:
            query = select(MenuItem).where(MenuItem.is_available == 1)
            if category:
                query = query.where(MenuItem.category == category)
            query = query.order_by(MenuItem.category, MenuItem.name)
            result = await db.execute(query)
            items = result.scalars().all()

        if dietary_pref:
            pref = dietary_pref.lower()
            items = [i for i in items if i.dietary_tags and pref in i.dietary_tags.lower()]

        if not items:
            return "No items found matching that criteria."

        lines = []
        for item in items:
            special = " — today's special!" if item.is_special else ""
            lines.append(f"{item.name} at {item.price:.2f} euro.{special} {item.description or ''}")
        return " ".join(lines[:6])  # cap to 6 for voice brevity

    @function_tool
    async def get_daily_specials(self) -> str:
        """Get today's special dishes at MaMi's."""
        async with async_session() as db:
            result = await db.execute(
                select(MenuItem).where(MenuItem.is_special == 1, MenuItem.is_available == 1)
            )
            items = result.scalars().all()

        if not items:
            return "No specials today."
        return " ".join(f"{i.name} at {i.price:.2f} euro. {i.description or ''}" for i in items)

    @function_tool
    async def recommend_wine(
        self,
        dish_name: Annotated[str, "Name of the dish to find wine pairings for"],
    ) -> str:
        """Recommend wine pairings for a specific dish."""
        async with async_session() as db:
            result = await db.execute(
                select(MenuItem).where(MenuItem.is_available == 1)
            )
            all_items = result.scalars().all()
            dish = next(
                (i for i in all_items if dish_name.lower() in i.name.lower()), None
            )
            if not dish:
                return f"I couldn't find {dish_name} on our menu."

            pairing_query = (
                select(WinePairing, MenuItem)
                .join(MenuItem, WinePairing.wine_id == MenuItem.id)
                .where(WinePairing.dish_id == dish.id)
            )
            result = await db.execute(pairing_query)
            pairings = result.all()

        if not pairings:
            return f"No specific wine pairings listed for {dish.name} yet."
        pairs = [f"{wine.name}: {pairing.notes or ''}" for pairing, wine in pairings]
        return f"For {dish.name} I recommend: {'. '.join(pairs[:2])}."

    # ── Reservation tools ─────────────────────────────────────────────────────

    @function_tool
    async def check_availability(
        self,
        date: Annotated[str, "Date in YYYY-MM-DD format"],
        time: Annotated[str, "Time in HH:MM format"],
        guests: Annotated[int, "Number of guests"],
    ) -> str:
        """Check if a table is available for a date, time, and party size."""
        async with async_session() as db:
            suitable_q = select(RestaurantTable).where(
                RestaurantTable.capacity >= guests, RestaurantTable.is_active == 1
            )
            result = await db.execute(suitable_q)
            all_suitable = result.scalars().all()

            if not all_suitable:
                return f"We don't have tables that accommodate {guests} guests."

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
            return f"Yes, we have {len(available)} table available for {guests} guests at {time} on {date}."
        return f"Sorry, no tables free for {guests} guests at {time} on {date}. Shall I check another time?"

    @function_tool
    async def make_reservation(
        self,
        guest_name: Annotated[str, "Guest's full name"],
        date: Annotated[str, "Date in YYYY-MM-DD format"],
        time: Annotated[str, "Time in HH:MM format, e.g. 19:00"],
        guests: Annotated[int, "Number of guests"],
        guest_email: Annotated[str | None, "Guest email (optional)"] = None,
        guest_phone: Annotated[str | None, "Guest phone (optional)"] = None,
        special_requests: Annotated[str | None, "Any special requests"] = None,
    ) -> str:
        """Book a table. Only call after confirming all details with the guest."""
        async with async_session() as db:
            booked_ids_q = select(Reservation.table_id).where(
                Reservation.date == date,
                Reservation.time_slot == time,
                Reservation.status != "cancelled",
                Reservation.table_id.isnot(None),
            )
            booked_result = await db.execute(booked_ids_q)
            booked_ids = {row[0] for row in booked_result.all()}

            suitable_q = (
                select(RestaurantTable)
                .where(RestaurantTable.capacity >= guests, RestaurantTable.is_active == 1)
                .order_by(RestaurantTable.capacity)
            )
            result = await db.execute(suitable_q)
            all_suitable = result.scalars().all()
            table = next((t for t in all_suitable if t.id not in booked_ids), None)

            if not table:
                return f"No tables available for {guests} guests at {time} on {date}."

            booking_ref = f"MM-{uuid.uuid4().hex[:8].upper()}"
            reservation = Reservation(
                booking_ref=booking_ref,
                guest_name=guest_name,
                guest_email=guest_email,
                guest_phone=guest_phone,
                party_size=guests,
                date=date,
                time_slot=time,
                table_id=table.id,
                special_requests=special_requests,
                source="voice",
            )
            db.add(reservation)
            await db.commit()

        return (
            f"Perfetto! Reservation confirmed for {guest_name}, "
            f"party of {guests}, on {date} at {time}. "
            f"Your booking reference is {booking_ref}."
        )

    @function_tool
    async def cancel_reservation(
        self,
        booking_ref: Annotated[str, "Booking reference code, e.g. MM-XXXXXXXX"],
    ) -> str:
        """Cancel an existing reservation by booking reference."""
        async with async_session() as db:
            ref = booking_ref.strip().upper()
            result = await db.execute(
                select(Reservation).where(Reservation.booking_ref == ref)
            )
            reservation = result.scalar_one_or_none()
            if not reservation:
                return f"No reservation found with reference {ref}."
            if reservation.status == "cancelled":
                return "That reservation is already cancelled."
            reservation.status = "cancelled"
            await db.commit()

        return (
            f"Done — reservation {ref} for {reservation.guest_name} "
            f"on {reservation.date} at {reservation.time_slot} has been cancelled."
        )

    # ── Restaurant info ───────────────────────────────────────────────────────

    @function_tool
    async def get_restaurant_info(
        self,
        topic: Annotated[
            str,
            "Topic to retrieve: hours, location, about, or booking_settings",
        ],
    ) -> str:
        """Get restaurant information — opening hours, location, or story."""
        async with async_session() as db:
            result = await db.execute(
                select(RestaurantConfig).where(RestaurantConfig.key == topic)
            )
            config = result.scalar_one_or_none()

        if not config:
            return f"No info found for '{topic}'."
        try:
            return json.dumps(json.loads(config.value), indent=2)
        except json.JSONDecodeError:
            return config.value


# ── Entrypoint ────────────────────────────────────────────────────────────────


async def entrypoint(ctx: JobContext) -> None:
    """Called once per LiveKit room — sets up the Sofia voice pipeline."""
    await ctx.connect()

    session = AgentSession(
        stt=lk_openai.STT(model="whisper-1"),
        llm=lk_openai.LLM(model=settings.OPENAI_MODEL),
        tts=lk_openai.TTS(voice="nova"),
        vad=silero.VAD.load(),
    )

    # ── Latency timing ────────────────────────────────────────────────────────
    # Tracks wall-clock time between speech end and first agent audio.
    # user_input_transcribed fires when STT finalises the transcript.
    # conversation_item_added fires when the agent's reply is added (TTS started).
    _t: dict[str, float] = {}

    @session.on("user_input_transcribed")
    def on_transcribed(ev):
        _t["transcribed_at"] = time.perf_counter()
        logger.info(
            "[TIMING] STT transcript ready: %r  (is_final=%s)",
            getattr(ev, "transcript", ""),
            getattr(ev, "is_final", "?"),
        )

    @session.on("conversation_item_added")
    def on_item_added(ev):
        item = getattr(ev, "item", None)
        role = getattr(item, "role", None) if item else None
        if role == "assistant" and "transcribed_at" in _t:
            rtt = time.perf_counter() - _t["transcribed_at"]
            logger.info("[TIMING] STT→LLM→TTS reply ready: %.2fs total RTT", rtt)
            _t.clear()

    @session.on("user_state_changed")
    def on_user_state(ev):
        state = getattr(ev, "new_state", "?")
        logger.info("[TIMING] User state → %s", state)
        if state == "speaking":
            _t["speech_start"] = time.perf_counter()
        elif state in ("listening", "idle") and "speech_start" in _t:
            dur = time.perf_counter() - _t["speech_start"]
            logger.info("[TIMING] User spoke for %.2fs", dur)

    await session.start(room=ctx.room, agent=SofiaVoiceAgent())
