"""API routes for PromptChart."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any

from .intent_resolver import IntentResolver
from .types import response_to_dict


class ChartRequest(BaseModel):
    prompt: str
    context: dict[str, Any] | None = None


def create_chart_router(resolver: IntentResolver) -> APIRouter:
    router = APIRouter()

    @router.post("/")
    async def generate_chart(request: ChartRequest):
        try:
            result = resolver.resolve(request.prompt, request.context)
            return response_to_dict(result)
        except Exception as e:
            print(f"Chart generation error: {e}")
            raise HTTPException(status_code=500, detail={"error": str(e), "code": "INTERNAL_ERROR"})

    return router
