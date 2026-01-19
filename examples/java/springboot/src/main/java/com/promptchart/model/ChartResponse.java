package com.promptchart.model;

import java.util.Map;

public record ChartResponse(
    ChartSpec chartSpec,
    ChartData data,
    Map<String, Object> metadata
) {
    public record ChartSpec(
        String type,
        String title,
        Map<String, Object> xAxis,
        Map<String, Object> yAxis,
        Map<String, Object> legend
    ) {}
}
