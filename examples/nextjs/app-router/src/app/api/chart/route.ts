import { NextRequest, NextResponse } from 'next/server';
import { OpenAIProvider } from '@/lib/llm';
import { MockDataAdapter } from '@/lib/adapters';
import { IntentResolver } from '@/lib/resolver';

const adapter = new MockDataAdapter();
const llm = new OpenAIProvider(
  process.env.OPENAI_API_KEY || '',
  process.env.OPENAI_MODEL || 'gpt-4o-mini'
);
const resolver = new IntentResolver(llm, adapter);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid prompt' }, { status: 400 });
    }

    const result = await resolver.resolve(prompt);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Chart generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
