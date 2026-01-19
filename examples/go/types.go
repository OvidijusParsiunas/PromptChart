package main

// Metric defines what to measure
type Metric struct {
	Field       string `json:"field"`
	Aggregation string `json:"aggregation"`
	Label       string `json:"label,omitempty"`
}

// Dimension defines how to group data
type Dimension struct {
	Field       string `json:"field"`
	Granularity string `json:"granularity,omitempty"`
}

// Filter defines conditions to apply
type Filter struct {
	Field    string `json:"field"`
	Operator string `json:"operator"`
	Value    any    `json:"value"`
}

// ChartIntent is what the LLM produces
type ChartIntent struct {
	Dataset    string      `json:"dataset"`
	Metrics    []Metric    `json:"metrics"`
	Dimensions []Dimension `json:"dimensions,omitempty"`
	Filters    []Filter    `json:"filters,omitempty"`
	ChartType  string      `json:"chartType"`
	Title      string      `json:"title,omitempty"`
	SortBy     string      `json:"sortBy,omitempty"`
	SortOrder  string      `json:"sortOrder,omitempty"`
	Limit      int         `json:"limit,omitempty"`
}

// ChartDataset is Chart.js compatible
type ChartDataset struct {
	Label           string   `json:"label"`
	Data            []float64 `json:"data"`
	BackgroundColor any      `json:"backgroundColor,omitempty"`
	BorderColor     any      `json:"borderColor,omitempty"`
	BorderWidth     int      `json:"borderWidth,omitempty"`
}

// ChartData is Chart.js compatible
type ChartData struct {
	Labels   []string       `json:"labels"`
	Datasets []ChartDataset `json:"datasets"`
}

// ChartSpec defines rendering hints
type ChartSpec struct {
	Type   string         `json:"type"`
	Title  string         `json:"title"`
	XAxis  map[string]any `json:"xAxis,omitempty"`
	YAxis  map[string]any `json:"yAxis,omitempty"`
	Legend map[string]any `json:"legend,omitempty"`
}

// ChartResponse is the API response
type ChartResponse struct {
	ChartSpec ChartSpec      `json:"chartSpec"`
	Data      ChartData      `json:"data"`
	Metadata  map[string]any `json:"metadata,omitempty"`
}

// ChartRequest is the API request
type ChartRequest struct {
	Prompt  string         `json:"prompt"`
	Context map[string]any `json:"context,omitempty"`
}

// ErrorResponse for errors
type ErrorResponse struct {
	Error string `json:"error"`
	Code  string `json:"code"`
}
