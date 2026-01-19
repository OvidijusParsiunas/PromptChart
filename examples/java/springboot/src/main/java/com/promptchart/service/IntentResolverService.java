package com.promptchart.service;

import com.promptchart.adapter.DataAdapter;
import com.promptchart.llm.LLMProvider;
import com.promptchart.model.ChartResponse;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class IntentResolverService {

    private static final List<String> CHART_TYPES = List.of("bar", "line", "pie", "doughnut", "area", "scatter");

    private final LLMProvider llmProvider;
    private final DataAdapter dataAdapter;

    public IntentResolverService(LLMProvider llmProvider, DataAdapter dataAdapter) {
        this.llmProvider = llmProvider;
        this.dataAdapter = dataAdapter;
    }

    public ChartResponse resolve(String prompt) {
        // Build context for LLM
        Map<String, Map<String, List<String>>> datasets = new HashMap<>();
        for (var ds : dataAdapter.getAvailableDatasets()) {
            datasets.put(ds, Map.of(
                "metrics", dataAdapter.getAvailableMetrics(ds),
                "dimensions", dataAdapter.getAvailableDimensions(ds)
            ));
        }

        // Generate intent
        var intent = llmProvider.generateIntent(prompt, datasets, CHART_TYPES);

        // Execute query
        var data = dataAdapter.executeQuery(intent);

        // Build chart spec
        var dimension = intent.dimensions() != null && !intent.dimensions().isEmpty()
            ? intent.dimensions().get(0).field() : "value";
        var metric = intent.metrics().get(0);
        var metricLabel = metric.label() != null ? metric.label() : metric.aggregation() + "(" + metric.field() + ")";
        var title = intent.title() != null ? intent.title() : metricLabel + " by " + dimension;

        var chartSpec = new ChartResponse.ChartSpec(
            intent.chartType(),
            title,
            intent.dimensions() != null && !intent.dimensions().isEmpty()
                ? Map.of("label", dimension, "type", "category") : null,
            Map.of("label", metricLabel, "type", "linear"),
            Map.of("position", "top", "display",
                intent.metrics().size() > 1 || "pie".equals(intent.chartType()) || "doughnut".equals(intent.chartType()))
        );

        return new ChartResponse(chartSpec, data, Map.of(
            "generatedAt", Instant.now().toString(),
            "dataset", intent.dataset(),
            "recordCount", data.labels().size()
        ));
    }
}
