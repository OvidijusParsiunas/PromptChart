import { Injectable } from '@nestjs/common';
import type { LLMProvider, IntentContext } from '../llm/types';
import type { DataAdapter } from '../adapters/base';
import type { ChartIntent, ChartResponse, ChartSpec, Granularity } from '../types';
import { OpenAIProvider } from '../llm/openai';
import { MockDataAdapter } from '../adapters/mock';

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

@Injectable()
export class ChartService {
  private llm: LLMProvider;
  private adapter: DataAdapter;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY ?? '';
    if (!apiKey) {
      console.warn('Warning: OPENAI_API_KEY not set. LLM features will not work.');
    }

    this.llm = new OpenAIProvider({
      apiKey,
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
    });
    this.adapter = new MockDataAdapter();
  }

  async resolve(prompt: string, additionalContext?: Record<string, unknown>): Promise<ChartResponse> {
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

    const { intent } = await this.llm.generateIntent(prompt, context);
    this.normalizeIntent(intent);

    const data = await this.adapter.executeQuery(intent);
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

  private normalizeIntent(intent: ChartIntent): void {
    if (intent.dimensions) {
      for (const dim of intent.dimensions) {
        if (dim.granularity) {
          const normalized = GRANULARITY_MAP[dim.granularity.toLowerCase()];
          if (normalized) {
            dim.granularity = normalized;
          } else {
            delete dim.granularity;
          }
        }
      }
    }
  }

  private buildChartSpec(intent: ChartIntent): ChartSpec {
    const dimension = intent.dimensions?.[0];
    const metric = intent.metrics[0];

    return {
      type: intent.chartType,
      title: intent.title ?? `${metric.aggregation}(${metric.field}) by ${dimension?.field ?? 'value'}`,
      xAxis: dimension
        ? {
            label: dimension.field,
            type: dimension.field === 'date' ? 'time' : 'category',
          }
        : undefined,
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
