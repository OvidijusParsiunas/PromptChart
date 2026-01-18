import type { ChartIntent, ChartData, Dataset } from '../types/index.js';

// Raw data record from a data source
export interface DataRecord {
  [key: string]: string | number | boolean | Date | null;
}

// Query result from an adapter
export interface QueryResult {
  records: DataRecord[];
  totalCount: number;
}

// Abstract data adapter interface
export interface DataAdapter {
  /**
   * Get the list of available datasets
   */
  getAvailableDatasets(): Dataset[];

  /**
   * Get available metrics for a dataset
   */
  getAvailableMetrics(dataset: Dataset): string[];

  /**
   * Get available dimensions for a dataset
   */
  getAvailableDimensions(dataset: Dataset): string[];

  /**
   * Execute a query based on the chart intent and return chart-ready data
   */
  executeQuery(intent: ChartIntent): Promise<ChartData>;
}
