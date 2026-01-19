import type { LLMProvider, LLMConfig, IntentContext, IntentResult } from './types';
import type { ChartIntent } from '../types';
import OpenAI from 'openai';

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
- IMPORTANT: Only use metrics and dimensions that belong to the chosen dataset
- Choose the most appropriate chart type for the data
- Use line charts for trends over time
- Use bar charts for comparisons
- Use pie/doughnut for proportions (must include a dimension to group by)
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
    const datasetInfo = Object.entries(context.datasets)
      .map(([name, meta]) => `  ${name}: metrics=[${meta.metrics.join(', ')}], dimensions=[${meta.dimensions.join(', ')}]`)
      .join('\n');

    const contextMessage = `Available datasets (use ONLY the metrics and dimensions listed for the chosen dataset):
${datasetInfo}

Chart types: ${context.availableChartTypes.join(', ')}
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

    return { intent, rawResponse };
  }
}
