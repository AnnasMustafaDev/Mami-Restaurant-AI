from pydantic import BaseModel, EmailStr


class ReservationCreate(BaseModel):
    guest_name: str
    guest_email: str | None = None
    guest_phone: str | None = None
    party_size: int
    date: str  # YYYY-MM-DD
    time_slot: str  # HH:MM
    special_requests: str | None = None
    source: str = "web"


class ReservationResponse(BaseModel):
    id: int
    booking_ref: str
    guest_name: str
    guest_email: str | None = None
    guest_phone: str | None = None
    party_size: int
    date: str
    time_slot: str
    special_requests: str | None = None
    status: str
    source: str
    created_at: str

    model_config = {"from_attributes": True}


class AvailabilityQuery(BaseModel):
    date: str
    time_slot: str
    guests: int


class AvailabilityResponse(BaseModel):
    available: bool
    available_tables: int
    message: str
