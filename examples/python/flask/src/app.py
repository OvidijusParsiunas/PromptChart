"""Flask application entry point."""

import os
from datetime import datetime, timezone

from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from .llm import OpenAIProvider, LLMConfig
from .adapters import MockDataAdapter
from .intent_resolver import IntentResolver
from .routes import create_chart_blueprint

load_dotenv()


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)

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
    app.register_blueprint(create_chart_blueprint(intent_resolver), url_prefix="/api/chart")

    @app.route("/health")
    def health_check():
        return jsonify({"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()})

    return app


def main():
    app = create_app()
    port = int(os.getenv("PORT", 3000))
    print(f"PromptChart backend running at http://localhost:{port}")
    print(f"API endpoint: POST http://localhost:{port}/api/chart")
    app.run(host="0.0.0.0", port=port, debug=True)


if __name__ == "__main__":
    main()
