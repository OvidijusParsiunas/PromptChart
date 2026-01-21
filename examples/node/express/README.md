## Node.js + Express Backend Example

A complete Express backend for PromptChart that converts natural language prompts into chart specifications using OpenAI.

### 🚀 Quick Start

Get running in 3 commands:

```bash
npm install
cp .env.example .env   # Add your OPENAI_API_KEY
npm run dev
```

That's it. Your server is live at `http://localhost:3000`.

### 🖥️ Using with the UI

This backend is designed to work with the [UI example](../../ui/README.md) which calls the `http://localhost:3000/api/chart` endpoint.

### 🔌 Add to existing server

**1. Install dependencies:**

```bash
npm install openai dotenv
```

**2. Copy these files to your project:**

```
src/llm/openai.ts
src/adapters/mock.ts         # or write your own
src/services/intent-resolver.ts
src/routes/chart.ts
src/types/index.ts
```

**3. Register the router in your Express app (e.g., `index.ts`):**

```typescript
import {OpenAIProvider} from './llm/openai.js';
import {MockDataAdapter} from './adapters/mock.js'; // Replace with your adapter
import {IntentResolver} from './services/intent-resolver.js';
import {createChartRouter} from './routes/chart.js';

const intentResolver = new IntentResolver({
  llmProvider: new OpenAIProvider({apiKey: process.env.OPENAI_API_KEY}),
  dataAdapter: new MockDataAdapter(), // Swap for your real data
});

app.use('/api/chart', createChartRouter(intentResolver));
```

Done. Your app now has a `POST /api/chart` endpoint.

### 🗄️ Data Adapter

This server uses a mock adapter (`src/adapters/mock.ts`). To connect your own data, implement the `DataAdapter` interface:

```typescript
interface DataAdapter {
  getAvailableDatasets(): string[];
  getAvailableMetrics(dataset: string): string[];
  getAvailableDimensions(dataset: string): string[];
  executeQuery(intent: ChartIntent): Promise<ChartData>;
}
```

The first three methods tell the LLM what's queryable. The last one runs the actual query and returns Chart.js-compatible data.

### 🤖 LLM Provider

This server uses OpenAI (`src/llm/openai.ts`). To use a different LLM, implement the `LLMProvider` interface:

```typescript
interface LLMProvider {
  generateIntent(prompt: string, context: IntentContext): Promise<IntentResult>;
}
```

The method receives the user's prompt plus context (available datasets, metrics, dimensions) and must return a parsed `ChartIntent`. See `OpenAIProvider` in `src/llm/openai.ts` for an example implementation.

### ⚙️ How It Works

<img width="2562" height="808" alt="architecture" src="https://github.com/user-attachments/assets/8b62da40-2260-4053-a077-bae62a956ba5" />

1. `prompt-chart` component sends a natural language prompt (e.g., "Show sales by region")
2. Backend sends the prompt to an LLM to generate structured intent
3. A data adapter executes the query against your data source
4. Chart-ready data is returned and rendered
