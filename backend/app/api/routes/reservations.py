import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.reservation import Reservation
from app.models.restaurant_table import RestaurantTable
from app.schemas.reservation import (
    AvailabilityResponse,
    ReservationCreate,
    ReservationResponse,
)

router = APIRouter(prefix="/reservations", tags=["reservations"])


@router.get("/availability", response_model=AvailabilityResponse)
async def check_availability(
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    time_slot: str = Query(..., description="Time in HH:MM format"),
    guests: int = Query(..., description="Number of guests"),
    db: AsyncSession = Depends(get_db),
):
    """Check table availability for a given date, time, and party size."""
    # Find tables that can fit this party size
    suitable_tables = select(RestaurantTable).where(
        RestaurantTable.capacity >= guests,
        RestaurantTable.is_active == 1,
    )
    result = await db.execute(suitable_tables)
    all_suitable = result.scalars().all()

    if not all_suitable:
        return AvailabilityResponse(
            available=False,
            available_tables=0,
            message=f"No tables available for a party of {guests}.",
        )

    # Find which of those are already booked at this slot
    booked_table_ids = select(Reservation.table_id).where(
        Reservation.date == date,
        Reservation.time_slot == time_slot,
        Reservation.status != "cancelled",
        Reservation.table_id.isnot(None),
    )
    booked_result = await db.execute(booked_table_ids)
    booked_ids = {row[0] for row in booked_result.all()}

    available = [t for t in all_suitable if t.id not in booked_ids]

    if available:
        return AvailabilityResponse(
            available=True,
            available_tables=len(available),
            message=f"{len(available)} table(s) available for {guests} guests.",
        )
    return AvailabilityResponse(
        available=False,
        available_tables=0,
        message=f"No tables available for {guests} guests at {time_slot} on {date}.",
    )


@router.post("", response_model=ReservationResponse, status_code=201)
async def create_reservation(
    data: ReservationCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new reservation. Auto-assigns a suitable table."""
    # Find an available table for this party size/slot
    booked_table_ids = select(Reservation.table_id).where(
        Reservation.date == data.date,
        Reservation.time_slot == data.time_slot,
        Reservation.status != "cancelled",
        Reservation.table_id.isnot(None),
    )
    booked_result = await db.execute(booked_table_ids)
    booked_ids = {row[0] for row in booked_result.all()}

    suitable_tables = select(RestaurantTable).where(
        RestaurantTable.capacity >= data.party_size,
        RestaurantTable.is_active == 1,
    ).order_by(RestaurantTable.capacity)  # prefer smallest suitable table
    result = await db.execute(suitable_tables)
    all_suitable = result.scalars().all()

    available_table = next((t for t in all_suitable if t.id not in booked_ids), None)
    if not available_table:
        raise HTTPException(
            status_code=409,
            detail=f"No tables available for {data.party_size} guests at {data.time_slot} on {data.date}.",
        )

    booking_ref = f"MM-{uuid.uuid4().hex[:8].upper()}"

    reservation = Reservation(
        booking_ref=booking_ref,
        guest_name=data.guest_name,
        guest_email=data.guest_email,
        guest_phone=data.guest_phone,
        party_size=data.party_size,
        date=data.date,
        time_slot=data.time_slot,
        table_id=available_table.id,
        special_requests=data.special_requests,
        source=data.source,
    )
    db.add(reservation)
    await db.commit()
    await db.refresh(reservation)

    return reservation


@router.get("/{booking_ref}", response_model=ReservationResponse)
async def get_reservation(booking_ref: str, db: AsyncSession = Depends(get_db)):
    """Look up a reservation by booking reference."""
    query = select(Reservation).where(Reservation.booking_ref == booking_ref)
    result = await db.execute(query)
    reservation = result.scalar_one_or_none()

    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return reservation


@router.delete("/{booking_ref}", response_model=ReservationResponse)
async def cancel_reservation(booking_ref: str, db: AsyncSession = Depends(get_db)):
    """Cancel a reservation by booking reference."""
    query = select(Reservation).where(Reservation.booking_ref == booking_ref)
    result = await db.execute(query)
    reservation = result.scalar_one_or_none()

    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    if reservation.status == "cancelled":
        raise HTTPException(status_code=400, detail="Reservation is already cancelled")

    reservation.status = "cancelled"
    await db.commit()
    await db.refresh(reservation)

    return reservation
