from fastapi import APIRouter

from app.core.config import settings

router = APIRouter(tags=["health"])


@router.get("/health")
def api_health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "singflow-api",
        "environment": settings.app_env,
        "llm_provider": settings.llm_provider,
    }
