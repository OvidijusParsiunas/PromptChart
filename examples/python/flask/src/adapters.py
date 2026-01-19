"""Data adapters for PromptChart."""

from abc import ABC, abstractmethod
from .types import ChartIntent, ChartData, ChartDataset, Dataset, Filter

# Color palettes for charts
COLORS = {
    "primary": [
        "rgba(59, 130, 246, 0.8)",
        "rgba(16, 185, 129, 0.8)",
        "rgba(245, 158, 11, 0.8)",
        "rgba(239, 68, 68, 0.8)",
        "rgba(139, 92, 246, 0.8)",
        "rgba(236, 72, 153, 0.8)",
        "rgba(20, 184, 166, 0.8)",
        "rgba(249, 115, 22, 0.8)",
    ],
    "border": [
        "rgba(59, 130, 246, 1)",
        "rgba(16, 185, 129, 1)",
        "rgba(245, 158, 11, 1)",
        "rgba(239, 68, 68, 1)",
        "rgba(139, 92, 246, 1)",
        "rgba(236, 72, 153, 1)",
        "rgba(20, 184, 166, 1)",
        "rgba(249, 115, 22, 1)",
    ],
}

# Mock data
MOCK_DATA: dict[Dataset, list[dict]] = {
    "sales": [
        {"month": "Jan", "quarter": "Q1", "year": 2024, "region": "North", "category": "Electronics", "amount": 45000, "quantity": 120, "revenue": 45000},
        {"month": "Jan", "quarter": "Q1", "year": 2024, "region": "South", "category": "Electronics", "amount": 38000, "quantity": 95, "revenue": 38000},
        {"month": "Feb", "quarter": "Q1", "year": 2024, "region": "North", "category": "Electronics", "amount": 52000, "quantity": 140, "revenue": 52000},
        {"month": "Feb", "quarter": "Q1", "year": 2024, "region": "South", "category": "Electronics", "amount": 41000, "quantity": 105, "revenue": 41000},
        {"month": "Mar", "quarter": "Q1", "year": 2024, "region": "North", "category": "Electronics", "amount": 48000, "quantity": 130, "revenue": 48000},
        {"month": "Mar", "quarter": "Q1", "year": 2024, "region": "South", "category": "Electronics", "amount": 44000, "quantity": 115, "revenue": 44000},
    ],
    "users": [
        {"month": "Jan", "year": 2024, "channel": "Organic", "signups": 1200, "activeUsers": 8500, "sessions": 45000},
        {"month": "Jan", "year": 2024, "channel": "Paid", "signups": 800, "activeUsers": 3200, "sessions": 18000},
        {"month": "Feb", "year": 2024, "channel": "Organic", "signups": 1350, "activeUsers": 9200, "sessions": 51000},
        {"month": "Feb", "year": 2024, "channel": "Paid", "signups": 950, "activeUsers": 3800, "sessions": 21000},
    ],
    "products": [
        {"product": "Laptop Pro", "category": "Electronics", "price": 1299, "quantity": 450, "revenue": 584550, "cost": 400000, "profit": 184550},
        {"product": "Wireless Mouse", "category": "Electronics", "price": 49, "quantity": 2200, "revenue": 107800, "cost": 44000, "profit": 63800},
        {"product": "USB-C Hub", "category": "Electronics", "price": 79, "quantity": 1800, "revenue": 142200, "cost": 54000, "profit": 88200},
        {"product": "Headphones", "category": "Electronics", "price": 199, "quantity": 1100, "revenue": 218900, "cost": 88000, "profit": 130900},
    ],
    "orders": [
        {"month": "Jan", "status": "completed", "region": "North", "count": 1250, "amount": 125000},
        {"month": "Jan", "status": "pending", "region": "North", "count": 85, "amount": 8500},
        {"month": "Feb", "status": "completed", "region": "North", "count": 1380, "amount": 138000},
        {"month": "Mar", "status": "completed", "region": "North", "count": 1520, "amount": 152000},
    ],
    "inventory": [
        {"product": "Laptop Pro", "category": "Electronics", "quantity": 125, "status": "in_stock"},
        {"product": "Wireless Mouse", "category": "Electronics", "quantity": 580, "status": "in_stock"},
        {"product": "USB-C Hub", "category": "Electronics", "quantity": 45, "status": "low_stock"},
        {"product": "Headphones", "category": "Electronics", "quantity": 0, "status": "out_of_stock"},
    ],
}

DATASET_METADATA: dict[Dataset, dict[str, list[str]]] = {
    "sales": {"metrics": ["amount", "quantity", "revenue"], "dimensions": ["month", "quarter", "year", "region", "category"]},
    "users": {"metrics": ["signups", "activeUsers", "sessions"], "dimensions": ["month", "year", "channel"]},
    "products": {"metrics": ["price", "quantity", "revenue", "cost", "profit"], "dimensions": ["product", "category"]},
    "orders": {"metrics": ["count", "amount"], "dimensions": ["month", "status", "region"]},
    "inventory": {"metrics": ["quantity"], "dimensions": ["product", "category", "status"]},
}


class DataAdapter(ABC):
    @abstractmethod
    def get_available_datasets(self) -> list[Dataset]: ...
    @abstractmethod
    def get_available_metrics(self, dataset: Dataset) -> list[str]: ...
    @abstractmethod
    def get_available_dimensions(self, dataset: Dataset) -> list[str]: ...
    @abstractmethod
    def execute_query(self, intent: ChartIntent) -> ChartData: ...


class MockDataAdapter(DataAdapter):
    def get_available_datasets(self) -> list[Dataset]:
        return list(MOCK_DATA.keys())

    def get_available_metrics(self, dataset: Dataset) -> list[str]:
        return DATASET_METADATA.get(dataset, {}).get("metrics", [])

    def get_available_dimensions(self, dataset: Dataset) -> list[str]:
        return DATASET_METADATA.get(dataset, {}).get("dimensions", [])

    def execute_query(self, intent: ChartIntent) -> ChartData:
        data = MOCK_DATA.get(intent.dataset)
        if not data:
            raise ValueError(f"Unknown dataset: {intent.dataset}")

        # Apply filters
        filtered = self._apply_filters(data, intent.filters)
        # Group and aggregate
        return self._group_and_aggregate(filtered, intent)

    def _apply_filters(self, data: list[dict], filters: list[Filter] | None) -> list[dict]:
        if not filters:
            return data
        result = []
        for record in data:
            match = all(self._check_filter(record, f) for f in filters)
            if match:
                result.append(record)
        return result

    def _check_filter(self, record: dict, f: Filter) -> bool:
        value = record.get(f.field)
        if f.operator == "eq":
            return value == f.value
        if f.operator == "neq":
            return value != f.value
        if f.operator == "gt":
            return isinstance(value, (int, float)) and value > f.value
        if f.operator == "gte":
            return isinstance(value, (int, float)) and value >= f.value
        if f.operator == "lt":
            return isinstance(value, (int, float)) and value < f.value
        if f.operator == "lte":
            return isinstance(value, (int, float)) and value <= f.value
        if f.operator == "in":
            return isinstance(f.value, list) and value in f.value
        return True

    def _group_and_aggregate(self, data: list[dict], intent: ChartIntent) -> ChartData:
        dimension = intent.dimensions[0] if intent.dimensions else None
        metrics = intent.metrics

        if not dimension:
            labels = [m.label or f"{m.aggregation}({m.field})" for m in metrics]
            values = [self._aggregate(data, m.field, m.aggregation) for m in metrics]
            return ChartData(
                labels=labels,
                datasets=[ChartDataset(label="Value", data=values, background_color=COLORS["primary"][:len(values)], border_color=COLORS["border"][:len(values)])]
            )

        groups: dict[str, list[dict]] = {}
        for record in data:
            key = str(record.get(dimension.field, "Unknown"))
            groups.setdefault(key, []).append(record)

        labels = list(groups.keys())
        is_pie = intent.chart_type in ("pie", "doughnut")

        datasets = []
        for idx, metric in enumerate(metrics):
            metric_data = [self._aggregate(groups[label], metric.field, metric.aggregation) for label in labels]
            datasets.append(ChartDataset(
                label=metric.label or f"{metric.aggregation}({metric.field})",
                data=metric_data,
                background_color=COLORS["primary"][:len(labels)] if is_pie else COLORS["primary"][idx % len(COLORS["primary"])],
                border_color=COLORS["border"][:len(labels)] if is_pie else COLORS["border"][idx % len(COLORS["border"])],
            ))

        return ChartData(labels=labels, datasets=datasets)

    def _aggregate(self, records: list[dict], field: str, aggregation: str) -> float:
        values = [r[field] for r in records if isinstance(r.get(field), (int, float))]
        if not values:
            return 0.0
        if aggregation == "sum":
            return float(sum(values))
        if aggregation == "avg":
            return float(sum(values) / len(values))
        if aggregation == "min":
            return float(min(values))
        if aggregation == "max":
            return float(max(values))
        if aggregation == "count":
            return float(len(values))
        return float(sum(values))
