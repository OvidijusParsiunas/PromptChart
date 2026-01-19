"""Type definitions for PromptChart."""

from dataclasses import dataclass
from typing import Literal, Any

# Type aliases
Dataset = Literal["sales", "users", "products", "orders", "inventory"]
Aggregation = Literal["sum", "avg", "min", "max", "count"]
ChartType = Literal["bar", "line", "pie", "doughnut", "area", "scatter"]
FilterOperator = Literal["eq", "neq", "gt", "gte", "lt", "lte", "in", "between"]
Granularity = Literal["day", "week", "month", "quarter", "year"]


@dataclass
class Metric:
    field: str
    aggregation: Aggregation
    label: str | None = None


@dataclass
class Dimension:
    field: str
    granularity: Granularity | None = None


@dataclass
class Filter:
    field: str
    operator: FilterOperator
    value: str | int | float | list


@dataclass
class ChartIntent:
    dataset: Dataset
    metrics: list[Metric]
    chart_type: ChartType
    dimensions: list[Dimension] | None = None
    filters: list[Filter] | None = None
    title: str | None = None
    sort_by: str | None = None
    sort_order: str | None = None
    limit: int | None = None


@dataclass
class ChartDataset:
    label: str
    data: list[float]
    background_color: str | list[str] | None = None
    border_color: str | list[str] | None = None
    border_width: int = 1


@dataclass
class ChartData:
    labels: list[str]
    datasets: list[ChartDataset]


@dataclass
class ChartSpec:
    type: ChartType
    title: str
    x_axis: dict | None = None
    y_axis: dict | None = None
    legend: dict | None = None


@dataclass
class ChartResponse:
    chart_spec: ChartSpec
    data: ChartData
    metadata: dict | None = None


def response_to_dict(response: ChartResponse) -> dict:
    """Convert ChartResponse to JSON-serializable dict."""
    return {
        "chartSpec": {
            "type": response.chart_spec.type,
            "title": response.chart_spec.title,
            "xAxis": response.chart_spec.x_axis,
            "yAxis": response.chart_spec.y_axis,
            "legend": response.chart_spec.legend,
        },
        "data": {
            "labels": response.data.labels,
            "datasets": [
                {
                    "label": ds.label,
                    "data": ds.data,
                    "backgroundColor": ds.background_color,
                    "borderColor": ds.border_color,
                    "borderWidth": ds.border_width,
                }
                for ds in response.data.datasets
            ],
        },
        "metadata": response.metadata,
    }
