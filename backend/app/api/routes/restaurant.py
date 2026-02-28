import json

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.restaurant_config import RestaurantConfig

router = APIRouter(prefix="/restaurant", tags=["restaurant"])


@router.get("/info")
async def get_restaurant_info(db: AsyncSession = Depends(get_db)):
    """Get restaurant information (hours, location, about)."""
    query = select(RestaurantConfig)
    result = await db.execute(query)
    configs = result.scalars().all()

    info = {}
    for config in configs:
        try:
            info[config.key] = json.loads(config.value)
        except json.JSONDecodeError:
            info[config.key] = config.value

    return info
