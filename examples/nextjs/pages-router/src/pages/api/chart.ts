import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIProvider } from '@/lib/llm';
import { MockDataAdapter } from '@/lib/adapters';
import { IntentResolver } from '@/lib/resolver';

const adapter = new MockDataAdapter();
const llm = new OpenAIProvider(
  process.env.OPENAI_API_KEY || '',
  process.env.OPENAI_MODEL || 'gpt-4o-mini'
);
const resolver = new IntentResolver(llm, adapter);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid prompt' });
    }

    const result = await resolver.resolve(prompt);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Chart generation error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
