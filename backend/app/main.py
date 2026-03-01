import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import init_db, async_session
from app.api.routes import health, menu, reservations, chat, admin, restaurant
from app.services.seed import seed_database

logger = logging.getLogger(__name__)


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


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": str(exc)})


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

# 2026-02-13 16:00 | api-key-startup-check
