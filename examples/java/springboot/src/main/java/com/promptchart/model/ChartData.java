package com.promptchart.model;

import java.util.List;

public record ChartData(
    List<String> labels,
    List<Dataset> datasets
) {
    public record Dataset(
        String label,
        List<Double> data,
        Object backgroundColor,
        Object borderColor,
        int borderWidth
    ) {}
}
