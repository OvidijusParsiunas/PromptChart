"""FastAPI application entry point."""

import os
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .llm import OpenAIProvider, LLMConfig
from .adapters import MockDataAdapter
from .intent_resolver import IntentResolver
from .routes import create_chart_router

load_dotenv()


def create_app() -> FastAPI:
    app = FastAPI(title="PromptChart")

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Initialize components
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("Warning: OPENAI_API_KEY not set. LLM features will not work.")

    llm_provider = OpenAIProvider(LLMConfig(
        api_key=api_key or "",
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
    ))
    data_adapter = MockDataAdapter()
    intent_resolver = IntentResolver(llm_provider, data_adapter)

    # Register routes
    app.include_router(create_chart_router(intent_resolver), prefix="/api/chart")

    @app.get("/health")
    async def health_check():
        return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}

    return app


app = create_app()


def main():
    import uvicorn
    port = int(os.getenv("PORT", 3000))
    print(f"PromptChart backend running at http://localhost:{port}")
    print(f"API endpoint: POST http://localhost:{port}/api/chart")
    uvicorn.run(app, host="0.0.0.0", port=port)


if __name__ == "__main__":
    main()
