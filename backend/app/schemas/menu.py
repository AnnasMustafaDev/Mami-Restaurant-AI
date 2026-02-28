from pydantic import BaseModel


class MenuItemBase(BaseModel):
    name: str
    description: str | None = None
    category: str | None = None
    price: float
    dietary_tags: list[str] = []
    image_url: str | None = None
    is_available: bool = True
    is_special: bool = False


class MenuItemCreate(MenuItemBase):
    pass


class MenuItemUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    category: str | None = None
    price: float | None = None
    dietary_tags: list[str] | None = None
    image_url: str | None = None
    is_available: bool | None = None
    is_special: bool | None = None


class MenuItemResponse(MenuItemBase):
    id: int
    created_at: str

    model_config = {"from_attributes": True}


class WinePairingResponse(BaseModel):
    wine_id: int
    wine_name: str
    notes: str | None = None
