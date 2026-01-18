import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { OpenAIProvider } from './llm/index.js';
import { MockDataAdapter } from './adapters/index.js';
import { IntentResolver } from './services/index.js';
import { createChartRouter } from './routes/chart.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT ?? 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize components
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.warn('Warning: OPENAI_API_KEY not set. LLM features will not work.');
}

const llmProvider = new OpenAIProvider({
  apiKey: apiKey ?? '',
  model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
});

const dataAdapter = new MockDataAdapter();

const intentResolver = new IntentResolver({
  llmProvider,
  dataAdapter,
});

// Routes
app.use('/api/chart', createChartRouter(intentResolver));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, () => {
  console.log(`PromptChart backend running at http://localhost:${port}`);
  console.log(`API endpoint: POST http://localhost:${port}/api/chart`);
});

export { app };
