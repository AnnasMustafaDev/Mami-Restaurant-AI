from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db, async_session
from app.api.routes import health, menu, reservations, chat, admin, restaurant
from app.services.seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed data
    await init_db()
    async with async_session() as db:
        await seed_database(db)
    yield
    # Shutdown: nothing to clean up for SQLite


app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(health.router, prefix=settings.API_PREFIX)
app.include_router(menu.router, prefix=settings.API_PREFIX)
app.include_router(reservations.router, prefix=settings.API_PREFIX)
app.include_router(chat.router, prefix=settings.API_PREFIX)
app.include_router(admin.router, prefix=settings.API_PREFIX)
app.include_router(restaurant.router, prefix=settings.API_PREFIX)

# 2026-01-30 11:00 | # CORS configured

# 2026-01-30 16:20 | # health check added
