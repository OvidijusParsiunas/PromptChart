import type { ChartIntent } from '../types/index.js';

// LLM provider configuration
export interface LLMConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

// Context provided to the LLM for intent generation
export interface IntentContext {
  availableDatasets: string[];
  availableMetrics: string[];
  availableDimensions: string[];
  availableChartTypes: string[];
  additionalContext?: Record<string, unknown>;
}

// Result from LLM intent generation
export interface IntentResult {
  intent: ChartIntent;
  rawResponse?: string;
}

// Abstract LLM provider interface
export interface LLMProvider {
  /**
   * Generate a chart intent from a natural language prompt
   */
  generateIntent(prompt: string, context: IntentContext): Promise<IntentResult>;
}
