from fastapi import APIRouter

from app.api.routes.agent_runs import router as agent_runs_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.feedback import router as feedback_router
from app.api.routes.health import router as health_router
from app.api.routes.karaoke_sessions import router as karaoke_sessions_router
from app.api.routes.playlists import router as playlists_router
from app.api.routes.songs import router as songs_router
from app.api.routes.users import router as users_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(songs_router)
api_router.include_router(users_router)
api_router.include_router(karaoke_sessions_router)
api_router.include_router(playlists_router)
api_router.include_router(feedback_router)
api_router.include_router(agent_runs_router)
api_router.include_router(dashboard_router)
