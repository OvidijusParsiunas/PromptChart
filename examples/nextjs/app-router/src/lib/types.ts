export type Dataset = 'sales' | 'users' | 'products' | 'orders' | 'inventory';
export type Aggregation = 'sum' | 'avg' | 'min' | 'max' | 'count';
export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'scatter';
export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'between';
export type Granularity = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface Metric {
  field: string;
  aggregation: Aggregation;
  label?: string;
}

export interface Dimension {
  field: string;
  granularity?: Granularity;
}

export interface Filter {
  field: string;
  operator: FilterOperator;
  value: string | number | (string | number)[];
}

export interface ChartIntent {
  dataset: Dataset;
  metrics: Metric[];
  dimensions?: Dimension[];
  filters?: Filter[];
  chartType: ChartType;
  title?: string;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartSpec {
  type: ChartType;
  title: string;
  xAxis?: { label?: string; type?: string };
  yAxis?: { label?: string; type?: string };
  legend?: { position?: string; display?: boolean };
}

export interface ChartResponse {
  chartSpec: ChartSpec;
  data: ChartData;
  metadata?: Record<string, unknown>;
}

export interface ChartRequest {
  prompt: string;
  context?: Record<string, unknown>;
}
