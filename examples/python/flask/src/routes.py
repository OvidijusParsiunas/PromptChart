"""API routes for PromptChart."""

from flask import Blueprint, request, jsonify
from .intent_resolver import IntentResolver
from .types import response_to_dict


def create_chart_blueprint(resolver: IntentResolver) -> Blueprint:
    bp = Blueprint("chart", __name__)

    @bp.route("/", methods=["POST"])
    def generate_chart():
        try:
            data = request.get_json()
            if not data or not isinstance(data.get("prompt"), str):
                return jsonify({"error": "Missing or invalid prompt", "code": "INVALID_REQUEST"}), 400

            result = resolver.resolve(data["prompt"], data.get("context"))
            return jsonify(response_to_dict(result))
        except Exception as e:
            print(f"Chart generation error: {e}")
            return jsonify({"error": str(e), "code": "INTERNAL_ERROR"}), 500

    return bp
