package com.promptchart.model;

import java.util.List;

public record ChartIntent(
    String dataset,
    List<Metric> metrics,
    List<Dimension> dimensions,
    List<Filter> filters,
    String chartType,
    String title
) {
    public record Metric(String field, String aggregation, String label) {}
    public record Dimension(String field, String granularity) {}
    public record Filter(String field, String operator, Object value) {}
}
