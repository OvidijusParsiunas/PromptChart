// Dataset types - must match enum in intent.schema.json
export type Dataset = 'sales' | 'users' | 'products' | 'orders' | 'inventory';

// Metric field types
export type MetricField =
  | 'amount'
  | 'quantity'
  | 'price'
  | 'count'
  | 'revenue'
  | 'cost'
  | 'profit'
  | 'signups'
  | 'activeUsers'
  | 'sessions';

// Aggregation types
export type Aggregation = 'sum' | 'avg' | 'min' | 'max' | 'count';

// Dimension field types
export type DimensionField =
  | 'date'
  | 'month'
  | 'quarter'
  | 'year'
  | 'category'
  | 'region'
  | 'product'
  | 'status'
  | 'channel';

// Time granularity
export type Granularity = 'day' | 'week' | 'month' | 'quarter' | 'year';

// Filter field types
export type FilterField =
  | 'date'
  | 'month'
  | 'quarter'
  | 'year'
  | 'category'
  | 'region'
  | 'product'
  | 'status'
  | 'channel'
  | 'amount'
  | 'quantity'
  | 'price';

// Filter operators
export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'between';

// Chart types
export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'scatter';

// Sort options
export type SortBy = 'value' | 'label' | 'date';
export type SortOrder = 'asc' | 'desc';

// Metric definition
export interface Metric {
  field: MetricField;
  aggregation: Aggregation;
  label?: string;
}

// Dimension definition
export interface Dimension {
  field: DimensionField;
  granularity?: Granularity;
}

// Filter definition
export interface Filter {
  field: FilterField;
  operator: FilterOperator;
  value: string | number | string[] | number[];
}

// Main intent structure - what the LLM produces
export interface ChartIntent {
  dataset: Dataset;
  metrics: Metric[];
  dimensions?: Dimension[];
  filters?: Filter[];
  chartType: ChartType;
  title?: string;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  limit?: number;
}

// Chart specification for rendering
export interface ChartSpec {
  type: ChartType;
  title: string;
  xAxis?: {
    label?: string;
    type?: 'category' | 'time' | 'linear';
  };
  yAxis?: {
    label?: string;
    type?: 'linear' | 'logarithmic';
  };
  legend?: {
    position?: 'top' | 'bottom' | 'left' | 'right';
    display?: boolean;
  };
}

// Chart.js compatible dataset
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

// Chart.js compatible data structure
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

// API response structure
export interface ChartResponse {
  chartSpec: ChartSpec;
  data: ChartData;
  metadata?: {
    generatedAt: string;
    dataset: string;
    recordCount: number;
    intent: ChartIntent;
  };
}

// API request structure
export interface ChartRequest {
  prompt: string;
  context?: Record<string, unknown>;
}

// Error response
export interface ErrorResponse {
  error: string;
  code: string;
  details?: unknown;
}
