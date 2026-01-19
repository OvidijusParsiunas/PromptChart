package main

import (
	"context"
	"fmt"
	"strings"
	"time"
)

var granularityMap = map[string]string{
	"daily": "day", "weekly": "week", "monthly": "month",
	"quarterly": "quarter", "yearly": "year", "annual": "year",
	"day": "day", "week": "week", "month": "month", "quarter": "quarter", "year": "year",
}

// IntentResolver orchestrates LLM and adapter
type IntentResolver struct {
	llm     LLMProvider
	adapter DataAdapter
}

// NewIntentResolver creates a new resolver
func NewIntentResolver(llm LLMProvider, adapter DataAdapter) *IntentResolver {
	return &IntentResolver{llm: llm, adapter: adapter}
}

// Resolve processes a prompt and returns chart data
func (r *IntentResolver) Resolve(ctx context.Context, prompt string) (ChartResponse, error) {
	// Build context for LLM
	datasets := make(map[string]map[string][]string)
	for _, ds := range r.adapter.GetAvailableDatasets() {
		datasets[ds] = map[string][]string{
			"metrics":    r.adapter.GetAvailableMetrics(ds),
			"dimensions": r.adapter.GetAvailableDimensions(ds),
		}
	}

	intentCtx := IntentContext{
		Datasets:           datasets,
		AvailableChartTypes: []string{"bar", "line", "pie", "doughnut", "area", "scatter"},
	}

	// Generate intent
	intent, err := r.llm.GenerateIntent(ctx, prompt, intentCtx)
	if err != nil {
		return ChartResponse{}, err
	}

	// Normalize
	r.normalizeIntent(&intent)

	// Execute query
	data, err := r.adapter.ExecuteQuery(intent)
	if err != nil {
		return ChartResponse{}, err
	}

	// Build response
	return ChartResponse{
		ChartSpec: r.buildChartSpec(intent),
		Data:      data,
		Metadata: map[string]any{
			"generatedAt": time.Now().UTC().Format(time.RFC3339),
			"dataset":     intent.Dataset,
			"recordCount": len(data.Labels),
		},
	}, nil
}

func (r *IntentResolver) normalizeIntent(intent *ChartIntent) {
	for i := range intent.Dimensions {
		if intent.Dimensions[i].Granularity != "" {
			if normalized, ok := granularityMap[strings.ToLower(intent.Dimensions[i].Granularity)]; ok {
				intent.Dimensions[i].Granularity = normalized
			}
		}
	}
}

func (r *IntentResolver) buildChartSpec(intent ChartIntent) ChartSpec {
	var dimField string
	if len(intent.Dimensions) > 0 {
		dimField = intent.Dimensions[0].Field
	} else {
		dimField = "value"
	}

	metric := intent.Metrics[0]
	metricLabel := metric.Label
	if metricLabel == "" {
		metricLabel = fmt.Sprintf("%s(%s)", metric.Aggregation, metric.Field)
	}

	title := intent.Title
	if title == "" {
		title = fmt.Sprintf("%s by %s", metricLabel, dimField)
	}

	spec := ChartSpec{
		Type:  intent.ChartType,
		Title: title,
		YAxis: map[string]any{"label": metricLabel, "type": "linear"},
		Legend: map[string]any{
			"position": "top",
			"display":  len(intent.Metrics) > 1 || intent.ChartType == "pie" || intent.ChartType == "doughnut",
		},
	}

	if len(intent.Dimensions) > 0 {
		spec.XAxis = map[string]any{"label": dimField, "type": "category"}
	}

	return spec
}
