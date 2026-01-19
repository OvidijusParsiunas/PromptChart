package com.promptchart.adapter;

import com.promptchart.model.ChartData;
import com.promptchart.model.ChartIntent;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class MockDataAdapter implements DataAdapter {

    private static final List<String> PRIMARY_COLORS = List.of(
        "rgba(59, 130, 246, 0.8)", "rgba(16, 185, 129, 0.8)", "rgba(245, 158, 11, 0.8)",
        "rgba(239, 68, 68, 0.8)", "rgba(139, 92, 246, 0.8)", "rgba(236, 72, 153, 0.8)"
    );
    private static final List<String> BORDER_COLORS = List.of(
        "rgba(59, 130, 246, 1)", "rgba(16, 185, 129, 1)", "rgba(245, 158, 11, 1)",
        "rgba(239, 68, 68, 1)", "rgba(139, 92, 246, 1)", "rgba(236, 72, 153, 1)"
    );

    private static final Map<String, List<Map<String, Object>>> MOCK_DATA = Map.of(
        "sales", List.of(
            Map.of("month", "Jan", "region", "North", "amount", 45000.0, "quantity", 120.0, "revenue", 45000.0),
            Map.of("month", "Jan", "region", "South", "amount", 38000.0, "quantity", 95.0, "revenue", 38000.0),
            Map.of("month", "Feb", "region", "North", "amount", 52000.0, "quantity", 140.0, "revenue", 52000.0),
            Map.of("month", "Feb", "region", "South", "amount", 41000.0, "quantity", 105.0, "revenue", 41000.0),
            Map.of("month", "Mar", "region", "North", "amount", 48000.0, "quantity", 130.0, "revenue", 48000.0),
            Map.of("month", "Mar", "region", "South", "amount", 44000.0, "quantity", 115.0, "revenue", 44000.0)
        ),
        "users", List.of(
            Map.of("month", "Jan", "channel", "Organic", "signups", 1200.0, "activeUsers", 8500.0, "sessions", 45000.0),
            Map.of("month", "Jan", "channel", "Paid", "signups", 800.0, "activeUsers", 3200.0, "sessions", 18000.0),
            Map.of("month", "Feb", "channel", "Organic", "signups", 1350.0, "activeUsers", 9200.0, "sessions", 51000.0),
            Map.of("month", "Feb", "channel", "Paid", "signups", 950.0, "activeUsers", 3800.0, "sessions", 21000.0)
        ),
        "products", List.of(
            Map.of("product", "Laptop Pro", "category", "Electronics", "price", 1299.0, "quantity", 450.0, "revenue", 584550.0, "profit", 184550.0),
            Map.of("product", "Wireless Mouse", "category", "Electronics", "price", 49.0, "quantity", 2200.0, "revenue", 107800.0, "profit", 63800.0),
            Map.of("product", "USB-C Hub", "category", "Electronics", "price", 79.0, "quantity", 1800.0, "revenue", 142200.0, "profit", 88200.0),
            Map.of("product", "Headphones", "category", "Electronics", "price", 199.0, "quantity", 1100.0, "revenue", 218900.0, "profit", 130900.0)
        ),
        "orders", List.of(
            Map.of("month", "Jan", "status", "completed", "region", "North", "count", 1250.0, "amount", 125000.0),
            Map.of("month", "Jan", "status", "pending", "region", "North", "count", 85.0, "amount", 8500.0),
            Map.of("month", "Feb", "status", "completed", "region", "North", "count", 1380.0, "amount", 138000.0),
            Map.of("month", "Mar", "status", "completed", "region", "North", "count", 1520.0, "amount", 152000.0)
        ),
        "inventory", List.of(
            Map.of("product", "Laptop Pro", "category", "Electronics", "quantity", 125.0, "status", "in_stock"),
            Map.of("product", "Wireless Mouse", "category", "Electronics", "quantity", 580.0, "status", "in_stock"),
            Map.of("product", "USB-C Hub", "category", "Electronics", "quantity", 45.0, "status", "low_stock"),
            Map.of("product", "Headphones", "category", "Electronics", "quantity", 0.0, "status", "out_of_stock")
        )
    );

    private static final Map<String, Map<String, List<String>>> METADATA = Map.of(
        "sales", Map.of("metrics", List.of("amount", "quantity", "revenue"), "dimensions", List.of("month", "quarter", "year", "region", "category")),
        "users", Map.of("metrics", List.of("signups", "activeUsers", "sessions"), "dimensions", List.of("month", "year", "channel")),
        "products", Map.of("metrics", List.of("price", "quantity", "revenue", "cost", "profit"), "dimensions", List.of("product", "category")),
        "orders", Map.of("metrics", List.of("count", "amount"), "dimensions", List.of("month", "status", "region")),
        "inventory", Map.of("metrics", List.of("quantity"), "dimensions", List.of("product", "category", "status"))
    );

    @Override
    public List<String> getAvailableDatasets() {
        return new ArrayList<>(MOCK_DATA.keySet());
    }

    @Override
    public List<String> getAvailableMetrics(String dataset) {
        return METADATA.getOrDefault(dataset, Map.of()).getOrDefault("metrics", List.of());
    }

    @Override
    public List<String> getAvailableDimensions(String dataset) {
        return METADATA.getOrDefault(dataset, Map.of()).getOrDefault("dimensions", List.of());
    }

    @Override
    public ChartData executeQuery(ChartIntent intent) {
        var data = MOCK_DATA.getOrDefault(intent.dataset(), List.of());
        return groupAndAggregate(data, intent);
    }

    private ChartData groupAndAggregate(List<Map<String, Object>> data, ChartIntent intent) {
        var dimension = intent.dimensions() != null && !intent.dimensions().isEmpty() ? intent.dimensions().get(0) : null;
        var metrics = intent.metrics();

        if (dimension == null) {
            var labels = metrics.stream()
                .map(m -> m.label() != null ? m.label() : m.aggregation() + "(" + m.field() + ")")
                .toList();
            var values = metrics.stream()
                .map(m -> aggregate(data, m.field(), m.aggregation()))
                .toList();
            return new ChartData(labels, List.of(new ChartData.Dataset("Value", values,
                PRIMARY_COLORS.subList(0, Math.min(values.size(), PRIMARY_COLORS.size())),
                BORDER_COLORS.subList(0, Math.min(values.size(), BORDER_COLORS.size())), 1)));
        }

        Map<String, List<Map<String, Object>>> groups = new LinkedHashMap<>();
        for (var record : data) {
            var key = String.valueOf(record.getOrDefault(dimension.field(), "Unknown"));
            groups.computeIfAbsent(key, k -> new ArrayList<>()).add(record);
        }

        var labels = new ArrayList<>(groups.keySet());
        boolean isPie = "pie".equals(intent.chartType()) || "doughnut".equals(intent.chartType());

        var datasets = new ArrayList<ChartData.Dataset>();
        for (int i = 0; i < metrics.size(); i++) {
            var metric = metrics.get(i);
            var metricData = labels.stream()
                .map(label -> aggregate(groups.get(label), metric.field(), metric.aggregation()))
                .toList();

            Object bg = isPie ? PRIMARY_COLORS.subList(0, Math.min(labels.size(), PRIMARY_COLORS.size()))
                             : PRIMARY_COLORS.get(i % PRIMARY_COLORS.size());
            Object border = isPie ? BORDER_COLORS.subList(0, Math.min(labels.size(), BORDER_COLORS.size()))
                                  : BORDER_COLORS.get(i % BORDER_COLORS.size());

            var metricLabel = metric.label() != null ? metric.label() : metric.aggregation() + "(" + metric.field() + ")";
            datasets.add(new ChartData.Dataset(metricLabel, metricData, bg, border, 1));
        }

        return new ChartData(labels, datasets);
    }

    private Double aggregate(List<Map<String, Object>> records, String field, String aggregation) {
        var values = records.stream()
            .map(r -> r.get(field))
            .filter(v -> v instanceof Number)
            .map(v -> ((Number) v).doubleValue())
            .toList();

        if (values.isEmpty()) return 0.0;

        return switch (aggregation) {
            case "sum" -> values.stream().mapToDouble(Double::doubleValue).sum();
            case "avg" -> values.stream().mapToDouble(Double::doubleValue).average().orElse(0);
            case "min" -> values.stream().mapToDouble(Double::doubleValue).min().orElse(0);
            case "max" -> values.stream().mapToDouble(Double::doubleValue).max().orElse(0);
            case "count" -> (double) values.size();
            default -> values.stream().mapToDouble(Double::doubleValue).sum();
        };
    }
}
