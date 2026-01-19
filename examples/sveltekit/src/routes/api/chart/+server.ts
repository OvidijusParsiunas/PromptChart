import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { OPENAI_API_KEY, OPENAI_MODEL } from '$env/static/private';
import { OpenAIProvider } from '$lib/llm';
import { MockDataAdapter } from '$lib/adapters';
import { IntentResolver } from '$lib/resolver';

const adapter = new MockDataAdapter();
const llm = new OpenAIProvider(OPENAI_API_KEY, OPENAI_MODEL || 'gpt-4o-mini');
const resolver = new IntentResolver(llm, adapter);

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { prompt } = body;

		if (!prompt || typeof prompt !== 'string') {
			return json({ error: 'Missing or invalid prompt' }, { status: 400 });
		}

		const result = await resolver.resolve(prompt);
		return json(result);
	} catch (error) {
		console.error('Chart generation error:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Internal server error' },
			{ status: 500 }
		);
	}
};
