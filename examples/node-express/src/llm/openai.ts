import OpenAI from 'openai';
import type { LLMProvider, LLMConfig, IntentContext, IntentResult } from './types.js';
import type { ChartIntent } from '../types/index.js';

const SYSTEM_PROMPT = `You are a data visualization assistant. Your task is to convert natural language requests into structured JSON specifications for charts.

You must respond with valid JSON only, no markdown or explanations. The JSON must conform to this structure:

{
  "dataset": string,      // One of the available datasets
  "metrics": [{           // At least one metric required
    "field": string,      // Field to measure
    "aggregation": string // sum, avg, min, max, count
  }],
  "dimensions": [{        // Optional: how to group data
    "field": string,
    "granularity": string // For date fields: day, week, month, quarter, year
  }],
  "filters": [{           // Optional: filters to apply
    "field": string,
    "operator": string,   // eq, neq, gt, gte, lt, lte, in, between
    "value": any
  }],
  "chartType": string,    // bar, line, pie, doughnut, area, scatter
  "title": string,        // Optional: chart title
  "sortBy": string,       // Optional: value, label, date
  "sortOrder": string,    // Optional: asc, desc
  "limit": number         // Optional: max data points (1-100)
}

Guidelines:
- Choose the most appropriate chart type for the data
- Use line charts for trends over time
- Use bar charts for comparisons
- Use pie/doughnut for proportions
- Infer reasonable defaults when not specified
- Generate a descriptive title if not provided`;

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(config: LLMConfig) {
    this.client = new OpenAI({ apiKey: config.apiKey });
    this.model = config.model ?? 'gpt-4o-mini';
    this.maxTokens = config.maxTokens ?? 1000;
    this.temperature = config.temperature ?? 0.1;
  }

  async generateIntent(prompt: string, context: IntentContext): Promise<IntentResult> {
    const contextMessage = `Available context:
- Datasets: ${context.availableDatasets.join(', ')}
- Metrics: ${context.availableMetrics.join(', ')}
- Dimensions: ${context.availableDimensions.join(', ')}
- Chart types: ${context.availableChartTypes.join(', ')}
${context.additionalContext ? `\nAdditional context: ${JSON.stringify(context.additionalContext)}` : ''}`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `${contextMessage}\n\nUser request: ${prompt}` },
      ],
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      response_format: { type: 'json_object' },
    });

    const rawResponse = response.choices[0]?.message?.content;
    if (!rawResponse) {
      throw new Error('No response from OpenAI');
    }

    const intent = JSON.parse(rawResponse) as ChartIntent;

    return {
      intent,
      rawResponse,
    };
  }
}
