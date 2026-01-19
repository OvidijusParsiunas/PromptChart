import type { DataAdapter } from './adapters';
import type { LLMProvider, IntentContext } from './llm';
import type { ChartIntent, ChartResponse, ChartSpec, Granularity } from './types';

const GRANULARITY_MAP: Record<string, Granularity> = {
  daily: 'day',
  weekly: 'week',
  monthly: 'month',
  quarterly: 'quarter',
  yearly: 'year',
  annual: 'year',
  day: 'day',
  week: 'week',
  month: 'month',
  quarter: 'quarter',
  year: 'year',
};

export class IntentResolver {
  constructor(
    private llm: LLMProvider,
    private adapter: DataAdapter
  ) {}

  async resolve(prompt: string): Promise<ChartResponse> {
    // Build context for LLM
    const datasets: Record<string, { metrics: string[]; dimensions: string[] }> = {};
    for (const ds of this.adapter.getAvailableDatasets()) {
      datasets[ds] = {
        metrics: this.adapter.getAvailableMetrics(ds),
        dimensions: this.adapter.getAvailableDimensions(ds),
      };
    }

    const context: IntentContext = {
      datasets,
      availableChartTypes: ['bar', 'line', 'pie', 'doughnut', 'area', 'scatter'],
    };

    // Generate and normalize intent
    const intent = await this.llm.generateIntent(prompt, context);
    this.normalizeIntent(intent);

    // Execute query
    const data = this.adapter.executeQuery(intent);

    // Build response
    return {
      chartSpec: this.buildChartSpec(intent),
      data,
      metadata: {
        generatedAt: new Date().toISOString(),
        dataset: intent.dataset,
        recordCount: data.labels.length,
      },
    };
  }

  private normalizeIntent(intent: ChartIntent): void {
    if (intent.dimensions) {
      for (const dim of intent.dimensions) {
        if (dim.granularity) {
          const normalized = GRANULARITY_MAP[dim.granularity.toLowerCase()];
          if (normalized) dim.granularity = normalized;
          else delete dim.granularity;
        }
      }
    }
  }

  private buildChartSpec(intent: ChartIntent): ChartSpec {
    const dimension = intent.dimensions?.[0];
    const metric = intent.metrics[0];
    const metricLabel = metric.label ?? `${metric.aggregation}(${metric.field})`;

    return {
      type: intent.chartType,
      title: intent.title ?? `${metricLabel} by ${dimension?.field ?? 'value'}`,
      xAxis: dimension ? { label: dimension.field, type: 'category' } : undefined,
      yAxis: { label: metricLabel, type: 'linear' },
      legend: {
        position: 'top',
        display: intent.metrics.length > 1 || intent.chartType === 'pie' || intent.chartType === 'doughnut',
      },
    };
  }
}
