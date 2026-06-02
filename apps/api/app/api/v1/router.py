from fastapi import APIRouter

from app.api.routes.health import router as health_router
from app.api.routes.karaoke_sessions import router as karaoke_sessions_router
from app.api.routes.songs import router as songs_router
from app.api.routes.users import router as users_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(songs_router)
api_router.include_router(users_router)
api_router.include_router(karaoke_sessions_router)
