package main

var colors = struct {
	Primary []string
	Border  []string
}{
	Primary: []string{
		"rgba(59, 130, 246, 0.8)",
		"rgba(16, 185, 129, 0.8)",
		"rgba(245, 158, 11, 0.8)",
		"rgba(239, 68, 68, 0.8)",
		"rgba(139, 92, 246, 0.8)",
		"rgba(236, 72, 153, 0.8)",
		"rgba(20, 184, 166, 0.8)",
		"rgba(249, 115, 22, 0.8)",
	},
	Border: []string{
		"rgba(59, 130, 246, 1)",
		"rgba(16, 185, 129, 1)",
		"rgba(245, 158, 11, 1)",
		"rgba(239, 68, 68, 1)",
		"rgba(139, 92, 246, 1)",
		"rgba(236, 72, 153, 1)",
		"rgba(20, 184, 166, 1)",
		"rgba(249, 115, 22, 1)",
	},
}

var mockData = map[string][]map[string]any{
	"sales": {
		{"month": "Jan", "quarter": "Q1", "year": 2024, "region": "North", "category": "Electronics", "amount": 45000.0, "quantity": 120.0, "revenue": 45000.0},
		{"month": "Jan", "quarter": "Q1", "year": 2024, "region": "South", "category": "Electronics", "amount": 38000.0, "quantity": 95.0, "revenue": 38000.0},
		{"month": "Feb", "quarter": "Q1", "year": 2024, "region": "North", "category": "Electronics", "amount": 52000.0, "quantity": 140.0, "revenue": 52000.0},
		{"month": "Feb", "quarter": "Q1", "year": 2024, "region": "South", "category": "Electronics", "amount": 41000.0, "quantity": 105.0, "revenue": 41000.0},
		{"month": "Mar", "quarter": "Q1", "year": 2024, "region": "North", "category": "Electronics", "amount": 48000.0, "quantity": 130.0, "revenue": 48000.0},
		{"month": "Mar", "quarter": "Q1", "year": 2024, "region": "South", "category": "Electronics", "amount": 44000.0, "quantity": 115.0, "revenue": 44000.0},
	},
	"users": {
		{"month": "Jan", "year": 2024, "channel": "Organic", "signups": 1200.0, "activeUsers": 8500.0, "sessions": 45000.0},
		{"month": "Jan", "year": 2024, "channel": "Paid", "signups": 800.0, "activeUsers": 3200.0, "sessions": 18000.0},
		{"month": "Feb", "year": 2024, "channel": "Organic", "signups": 1350.0, "activeUsers": 9200.0, "sessions": 51000.0},
		{"month": "Feb", "year": 2024, "channel": "Paid", "signups": 950.0, "activeUsers": 3800.0, "sessions": 21000.0},
	},
	"products": {
		{"product": "Laptop Pro", "category": "Electronics", "price": 1299.0, "quantity": 450.0, "revenue": 584550.0, "cost": 400000.0, "profit": 184550.0},
		{"product": "Wireless Mouse", "category": "Electronics", "price": 49.0, "quantity": 2200.0, "revenue": 107800.0, "cost": 44000.0, "profit": 63800.0},
		{"product": "USB-C Hub", "category": "Electronics", "price": 79.0, "quantity": 1800.0, "revenue": 142200.0, "cost": 54000.0, "profit": 88200.0},
		{"product": "Headphones", "category": "Electronics", "price": 199.0, "quantity": 1100.0, "revenue": 218900.0, "cost": 88000.0, "profit": 130900.0},
	},
	"orders": {
		{"month": "Jan", "status": "completed", "region": "North", "count": 1250.0, "amount": 125000.0},
		{"month": "Jan", "status": "pending", "region": "North", "count": 85.0, "amount": 8500.0},
		{"month": "Feb", "status": "completed", "region": "North", "count": 1380.0, "amount": 138000.0},
		{"month": "Mar", "status": "completed", "region": "North", "count": 1520.0, "amount": 152000.0},
	},
	"inventory": {
		{"product": "Laptop Pro", "category": "Electronics", "quantity": 125.0, "status": "in_stock"},
		{"product": "Wireless Mouse", "category": "Electronics", "quantity": 580.0, "status": "in_stock"},
		{"product": "USB-C Hub", "category": "Electronics", "quantity": 45.0, "status": "low_stock"},
		{"product": "Headphones", "category": "Electronics", "quantity": 0.0, "status": "out_of_stock"},
	},
}

var datasetMetadata = map[string]struct {
	Metrics    []string
	Dimensions []string
}{
	"sales":     {Metrics: []string{"amount", "quantity", "revenue"}, Dimensions: []string{"month", "quarter", "year", "region", "category"}},
	"users":     {Metrics: []string{"signups", "activeUsers", "sessions"}, Dimensions: []string{"month", "year", "channel"}},
	"products":  {Metrics: []string{"price", "quantity", "revenue", "cost", "profit"}, Dimensions: []string{"product", "category"}},
	"orders":    {Metrics: []string{"count", "amount"}, Dimensions: []string{"month", "status", "region"}},
	"inventory": {Metrics: []string{"quantity"}, Dimensions: []string{"product", "category", "status"}},
}

// DataAdapter interface
type DataAdapter interface {
	GetAvailableDatasets() []string
	GetAvailableMetrics(dataset string) []string
	GetAvailableDimensions(dataset string) []string
	ExecuteQuery(intent ChartIntent) (ChartData, error)
}

// MockDataAdapter implements DataAdapter
type MockDataAdapter struct{}

func (m *MockDataAdapter) GetAvailableDatasets() []string {
	datasets := make([]string, 0, len(mockData))
	for k := range mockData {
		datasets = append(datasets, k)
	}
	return datasets
}

func (m *MockDataAdapter) GetAvailableMetrics(dataset string) []string {
	if meta, ok := datasetMetadata[dataset]; ok {
		return meta.Metrics
	}
	return nil
}

func (m *MockDataAdapter) GetAvailableDimensions(dataset string) []string {
	if meta, ok := datasetMetadata[dataset]; ok {
		return meta.Dimensions
	}
	return nil
}

func (m *MockDataAdapter) ExecuteQuery(intent ChartIntent) (ChartData, error) {
	data, ok := mockData[intent.Dataset]
	if !ok {
		return ChartData{}, nil
	}

	filtered := m.applyFilters(data, intent.Filters)
	return m.groupAndAggregate(filtered, intent), nil
}

func (m *MockDataAdapter) applyFilters(data []map[string]any, filters []Filter) []map[string]any {
	if len(filters) == 0 {
		return data
	}
	var result []map[string]any
	for _, record := range data {
		match := true
		for _, f := range filters {
			if !m.checkFilter(record, f) {
				match = false
				break
			}
		}
		if match {
			result = append(result, record)
		}
	}
	return result
}

func (m *MockDataAdapter) checkFilter(record map[string]any, f Filter) bool {
	value := record[f.Field]
	switch f.Operator {
	case "eq":
		return value == f.Value
	case "neq":
		return value != f.Value
	}
	return true
}

func (m *MockDataAdapter) groupAndAggregate(data []map[string]any, intent ChartIntent) ChartData {
	var dimension *Dimension
	if len(intent.Dimensions) > 0 {
		dimension = &intent.Dimensions[0]
	}

	if dimension == nil {
		labels := make([]string, len(intent.Metrics))
		values := make([]float64, len(intent.Metrics))
		for i, metric := range intent.Metrics {
			if metric.Label != "" {
				labels[i] = metric.Label
			} else {
				labels[i] = metric.Aggregation + "(" + metric.Field + ")"
			}
			values[i] = m.aggregate(data, metric.Field, metric.Aggregation)
		}
		return ChartData{
			Labels: labels,
			Datasets: []ChartDataset{{
				Label:           "Value",
				Data:            values,
				BackgroundColor: colors.Primary[:len(values)],
				BorderColor:     colors.Border[:len(values)],
				BorderWidth:     1,
			}},
		}
	}

	groups := make(map[string][]map[string]any)
	var labels []string
	for _, record := range data {
		key := toString(record[dimension.Field])
		if _, exists := groups[key]; !exists {
			labels = append(labels, key)
		}
		groups[key] = append(groups[key], record)
	}

	isPie := intent.ChartType == "pie" || intent.ChartType == "doughnut"
	datasets := make([]ChartDataset, len(intent.Metrics))

	for i, metric := range intent.Metrics {
		metricData := make([]float64, len(labels))
		for j, label := range labels {
			metricData[j] = m.aggregate(groups[label], metric.Field, metric.Aggregation)
		}

		var bg, border any
		if isPie {
			bg = colors.Primary[:len(labels)]
			border = colors.Border[:len(labels)]
		} else {
			bg = colors.Primary[i%len(colors.Primary)]
			border = colors.Border[i%len(colors.Border)]
		}

		label := metric.Label
		if label == "" {
			label = metric.Aggregation + "(" + metric.Field + ")"
		}

		datasets[i] = ChartDataset{
			Label:           label,
			Data:            metricData,
			BackgroundColor: bg,
			BorderColor:     border,
			BorderWidth:     1,
		}
	}

	return ChartData{Labels: labels, Datasets: datasets}
}

func (m *MockDataAdapter) aggregate(records []map[string]any, field, aggregation string) float64 {
	var values []float64
	for _, r := range records {
		if v, ok := r[field].(float64); ok {
			values = append(values, v)
		}
	}
	if len(values) == 0 {
		return 0
	}

	switch aggregation {
	case "sum":
		var sum float64
		for _, v := range values {
			sum += v
		}
		return sum
	case "avg":
		var sum float64
		for _, v := range values {
			sum += v
		}
		return sum / float64(len(values))
	case "min":
		min := values[0]
		for _, v := range values[1:] {
			if v < min {
				min = v
			}
		}
		return min
	case "max":
		max := values[0]
		for _, v := range values[1:] {
			if v > max {
				max = v
			}
		}
		return max
	case "count":
		return float64(len(values))
	default:
		var sum float64
		for _, v := range values {
			sum += v
		}
		return sum
	}
}

func toString(v any) string {
	if s, ok := v.(string); ok {
		return s
	}
	return "Unknown"
}
