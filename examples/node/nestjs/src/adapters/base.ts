import type { ChartIntent, ChartData, Dataset } from '../types';

// Raw data record from a data source
export interface DataRecord {
  [key: string]: string | number | boolean | Date | null;
}

// Abstract data adapter interface
export interface DataAdapter {
  getAvailableDatasets(): Dataset[];
  getAvailableMetrics(dataset: Dataset): string[];
  getAvailableDimensions(dataset: Dataset): string[];
  executeQuery(intent: ChartIntent): Promise<ChartData>;
}
