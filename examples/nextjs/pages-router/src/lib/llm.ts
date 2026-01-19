import OpenAI from 'openai';
import type { ChartIntent } from './types';

const SYSTEM_PROMPT = `You are a data visualization assistant. Convert natural language requests into JSON chart specifications.

Respond with valid JSON only:
{
  "dataset": string,
  "metrics": [{"field": string, "aggregation": "sum"|"avg"|"min"|"max"|"count"}],
  "dimensions": [{"field": string, "granularity": "day"|"week"|"month"|"quarter"|"year"}],
  "filters": [{"field": string, "operator": "eq"|"neq"|"gt"|"gte"|"lt"|"lte"|"in", "value": any}],
  "chartType": "bar"|"line"|"pie"|"doughnut"|"area"|"scatter",
  "title": string
}

Use only metrics/dimensions from the chosen dataset. Choose appropriate chart types.`;

export interface IntentContext {
  datasets: Record<string, { metrics: string[]; dimensions: string[] }>;
  availableChartTypes: string[];
}

export interface LLMProvider {
  generateIntent(prompt: string, context: IntentContext): Promise<ChartIntent>;
}

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model = 'gpt-4o-mini') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async generateIntent(prompt: string, context: IntentContext): Promise<ChartIntent> {
    const datasetInfo = Object.entries(context.datasets)
      .map(([name, meta]) => `  ${name}: metrics=[${meta.metrics.join(', ')}], dimensions=[${meta.dimensions.join(', ')}]`)
      .join('\n');

    const contextMsg = `Available datasets:\n${datasetInfo}\nChart types: ${context.availableChartTypes.join(', ')}`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `${contextMsg}\n\nRequest: ${prompt}` },
      ],
      max_tokens: 1000,
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    return JSON.parse(content) as ChartIntent;
  }
}
