"""LLM provider for PromptChart."""

import json
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any

from openai import OpenAI
from .types import ChartIntent, Metric, Dimension, Filter


@dataclass
class LLMConfig:
    api_key: str
    model: str = "gpt-4o-mini"
    max_tokens: int = 1000
    temperature: float = 0.1


@dataclass
class IntentContext:
    datasets: dict[str, dict[str, list[str]]]  # {name: {metrics: [...], dimensions: [...]}}
    available_chart_types: list[str]
    additional_context: dict[str, Any] | None = None


@dataclass
class IntentResult:
    intent: ChartIntent
    raw_response: str | None = None


class LLMProvider(ABC):
    @abstractmethod
    def generate_intent(self, prompt: str, context: IntentContext) -> IntentResult: ...


SYSTEM_PROMPT = """You are a data visualization assistant. Convert natural language requests into JSON chart specifications.

Respond with valid JSON only:
{
  "dataset": string,
  "metrics": [{"field": string, "aggregation": "sum"|"avg"|"min"|"max"|"count"}],
  "dimensions": [{"field": string, "granularity": "day"|"week"|"month"|"quarter"|"year"}],
  "filters": [{"field": string, "operator": "eq"|"neq"|"gt"|"gte"|"lt"|"lte"|"in", "value": any}],
  "chartType": "bar"|"line"|"pie"|"doughnut"|"area"|"scatter",
  "title": string
}

Use only metrics/dimensions from the chosen dataset. Choose appropriate chart types."""


class OpenAIProvider(LLMProvider):
    def __init__(self, config: LLMConfig):
        self.client = OpenAI(api_key=config.api_key)
        self.model = config.model
        self.max_tokens = config.max_tokens
        self.temperature = config.temperature

    def generate_intent(self, prompt: str, context: IntentContext) -> IntentResult:
        dataset_info = "\n".join(
            f"  {name}: metrics=[{', '.join(meta['metrics'])}], dimensions=[{', '.join(meta['dimensions'])}]"
            for name, meta in context.datasets.items()
        )

        context_message = f"Available datasets:\n{dataset_info}\nChart types: {', '.join(context.available_chart_types)}"

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"{context_message}\n\nRequest: {prompt}"},
            ],
            max_tokens=self.max_tokens,
            temperature=self.temperature,
            response_format={"type": "json_object"},
        )

        raw_response = response.choices[0].message.content
        if not raw_response:
            raise ValueError("No response from OpenAI")

        data = json.loads(raw_response)
        intent = self._parse_intent(data)
        return IntentResult(intent=intent, raw_response=raw_response)

    def _parse_intent(self, data: dict) -> ChartIntent:
        metrics = [Metric(field=m["field"], aggregation=m["aggregation"], label=m.get("label")) for m in data.get("metrics", [])]
        dimensions = [Dimension(field=d["field"], granularity=d.get("granularity")) for d in data.get("dimensions", [])] if data.get("dimensions") else None
        filters = [Filter(field=f["field"], operator=f["operator"], value=f["value"]) for f in data.get("filters", [])] if data.get("filters") else None

        return ChartIntent(
            dataset=data["dataset"],
            metrics=metrics,
            chart_type=data["chartType"],
            dimensions=dimensions,
            filters=filters,
            title=data.get("title"),
        )
