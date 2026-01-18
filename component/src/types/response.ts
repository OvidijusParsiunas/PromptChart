import {ChartSpec} from './chart';

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

export interface ChartResponse {
  chartSpec: ChartSpec;
  data: ChartData;
  metadata?: {
    generatedAt: string;
    dataset: string;
    recordCount: number;
  };
}

export type ChartResponseInput = ChartResponse | ChartResponse[];
