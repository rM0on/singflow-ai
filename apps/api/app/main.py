from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings


def create_app() -> FastAPI:
    app = FastAPI(
        title="SingFlow AI API",
        description="Phase 0 FastAPI scaffold for SingFlow AI.",
        version="0.1.0",
    )

    if settings.cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.cors_origins,
            allow_credentials=False,
            allow_methods=["GET", "OPTIONS"],
            allow_headers=["*"],
        )

    @app.get("/health", tags=["health"])
    def root_health() -> dict[str, str]:
        return {
            "status": "ok",
            "service": "singflow-api",
            "environment": settings.app_env,
        }

    app.include_router(api_router, prefix="/api/v1")
    return app


app = create_app()
