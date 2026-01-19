"""Intent resolver - orchestrates LLM and data adapter."""

from datetime import datetime, timezone
from typing import Any

from .adapters import DataAdapter
from .llm import LLMProvider, IntentContext
from .types import ChartIntent, ChartResponse, ChartSpec, Granularity

GRANULARITY_MAP: dict[str, Granularity] = {
    "daily": "day", "weekly": "week", "monthly": "month",
    "quarterly": "quarter", "yearly": "year", "annual": "year",
    "day": "day", "week": "week", "month": "month", "quarter": "quarter", "year": "year",
}


class IntentResolver:
    def __init__(self, llm_provider: LLMProvider, data_adapter: DataAdapter):
        self.llm = llm_provider
        self.adapter = data_adapter

    def resolve(self, prompt: str, additional_context: dict[str, Any] | None = None) -> ChartResponse:
        # Build context for LLM
        datasets = {
            ds: {"metrics": self.adapter.get_available_metrics(ds), "dimensions": self.adapter.get_available_dimensions(ds)}
            for ds in self.adapter.get_available_datasets()
        }

        context = IntentContext(
            datasets=datasets,
            available_chart_types=["bar", "line", "pie", "doughnut", "area", "scatter"],
            additional_context=additional_context,
        )

        # Generate and normalize intent
        result = self.llm.generate_intent(prompt, context)
        intent = result.intent
        self._normalize_intent(intent)

        # Execute query
        data = self.adapter.execute_query(intent)

        # Build response
        return ChartResponse(
            chart_spec=self._build_chart_spec(intent),
            data=data,
            metadata={
                "generatedAt": datetime.now(timezone.utc).isoformat(),
                "dataset": intent.dataset,
                "recordCount": len(data.labels),
            },
        )

    def _normalize_intent(self, intent: ChartIntent) -> None:
        if intent.dimensions:
            for dim in intent.dimensions:
                if dim.granularity:
                    dim.granularity = GRANULARITY_MAP.get(dim.granularity.lower())

    def _build_chart_spec(self, intent: ChartIntent) -> ChartSpec:
        dimension = intent.dimensions[0] if intent.dimensions else None
        metric = intent.metrics[0]
        metric_label = metric.label or f"{metric.aggregation}({metric.field})"

        return ChartSpec(
            type=intent.chart_type,
            title=intent.title or f"{metric_label} by {dimension.field if dimension else 'value'}",
            x_axis={"label": dimension.field, "type": "category"} if dimension else None,
            y_axis={"label": metric_label, "type": "linear"},
            legend={"position": "top", "display": len(intent.metrics) > 1 or intent.chart_type in ("pie", "doughnut")},
        )
