import type { ChartIntent } from '../types';

export interface LLMConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface DatasetMetadata {
  metrics: string[];
  dimensions: string[];
}

export interface IntentContext {
  datasets: Record<string, DatasetMetadata>;
  availableChartTypes: string[];
  additionalContext?: Record<string, unknown>;
}

export interface IntentResult {
  intent: ChartIntent;
  rawResponse?: string;
}

export interface LLMProvider {
  generateIntent(prompt: string, context: IntentContext): Promise<IntentResult>;
}
