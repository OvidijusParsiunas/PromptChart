import type { LLMProvider, IntentContext } from '../llm/types.js';
import type { DataAdapter } from '../adapters/base.js';
import type { ChartIntent, ChartResponse, ChartSpec, Granularity } from '../types/index.js';

// Normalize common LLM output variations
const GRANULARITY_MAP: Record<string, Granularity> = {
  'daily': 'day',
  'weekly': 'week',
  'monthly': 'month',
  'quarterly': 'quarter',
  'yearly': 'year',
  'annual': 'year',
  'day': 'day',
  'week': 'week',
  'month': 'month',
  'quarter': 'quarter',
  'year': 'year',
};

export interface IntentResolverConfig {
  llmProvider: LLMProvider;
  dataAdapter: DataAdapter;
}

export class IntentResolver {
  private llm: LLMProvider;
  private adapter: DataAdapter;

  constructor(config: IntentResolverConfig) {
    this.llm = config.llmProvider;
    this.adapter = config.dataAdapter;
  }

  /**
   * Process a natural language prompt and return chart data
   */
  async resolve(prompt: string, additionalContext?: Record<string, unknown>): Promise<ChartResponse> {
    // Build per-dataset context for LLM
    const datasetNames = this.adapter.getAvailableDatasets();
    const datasets: Record<string, { metrics: string[]; dimensions: string[] }> = {};

    for (const dataset of datasetNames) {
      datasets[dataset] = {
        metrics: this.adapter.getAvailableMetrics(dataset),
        dimensions: this.adapter.getAvailableDimensions(dataset),
      };
    }

    const context: IntentContext = {
      datasets,
      availableChartTypes: ['bar', 'line', 'pie', 'doughnut', 'area', 'scatter'],
      additionalContext,
    };

    // Generate intent from LLM
    const { intent } = await this.llm.generateIntent(prompt, context);

    // Normalize LLM output
    this.normalizeIntent(intent);

    // Execute query against data adapter
    const data = await this.adapter.executeQuery(intent);

    // Build chart specification
    const chartSpec = this.buildChartSpec(intent);

    return {
      chartSpec,
      data,
      metadata: {
        generatedAt: new Date().toISOString(),
        dataset: intent.dataset,
        recordCount: data.labels.length,
        intent,
      },
    };
  }

  /**
   * Normalize LLM output to match expected values
   */
  private normalizeIntent(intent: ChartIntent): void {
    // Normalize dimension granularities
    if (intent.dimensions) {
      for (const dim of intent.dimensions) {
        if (dim.granularity) {
          const normalized = GRANULARITY_MAP[dim.granularity.toLowerCase()];
          if (normalized) {
            dim.granularity = normalized;
          } else {
            // Remove invalid granularity rather than fail
            delete dim.granularity;
          }
        }
      }
    }
  }

  /**
   * Build chart specification from intent
   */
  private buildChartSpec(intent: ChartIntent): ChartSpec {
    const dimension = intent.dimensions?.[0];
    const metric = intent.metrics[0];

    return {
      type: intent.chartType,
      title: intent.title ?? `${metric.aggregation}(${metric.field}) by ${dimension?.field ?? 'value'}`,
      xAxis: dimension ? {
        label: dimension.field,
        type: dimension.field === 'date' ? 'time' : 'category',
      } : undefined,
      yAxis: {
        label: metric.label ?? `${metric.aggregation}(${metric.field})`,
        type: 'linear',
      },
      legend: {
        position: 'top',
        display: intent.metrics.length > 1 || intent.chartType === 'pie' || intent.chartType === 'doughnut',
      },
    };
  }
}
