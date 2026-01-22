## Next.js App Router Example

A full-stack Next.js example using the App Router with integrated backend API and [prompt-chart-react](https://www.npmjs.com/package/prompt-chart-react).

### 🚀 Quick Start

```bash
npm install
cp .env.example .env.local   # Add your OPENAI_API_KEY
npm run dev
```

That's it. Open `http://localhost:3000`.

### 📦 Using prompt-chart-react

```tsx
'use client';

import dynamic from 'next/dynamic';
import type {PromptChart as PromptChartType} from 'prompt-chart';

// Dynamic import with SSR disabled (web components need browser APIs)
const PromptChart = dynamic(() => import('prompt-chart-react').then((mod) => mod.PromptChart), {ssr: false});

export default function Page() {
  const chartRef = useRef<PromptChartType | null>(null);

  return <PromptChart ref={chartRef} connect={{url: '/api/chart'}} />;
}
```

**Key Points:**

- Use `'use client'` directive for components using prompt-chart-react
- Dynamic import with `ssr: false` is required (web components need browser APIs)
- Use `ref` to access chart methods like `fetchChart()`

### 🗄️ Data Adapter

This server uses a mock adapter (`src/lib/adapters.ts`). To connect your own data, implement the `DataAdapter` interface:

```typescript
interface DataAdapter {
  getAvailableDatasets(): string[];
  getAvailableMetrics(dataset: string): string[];
  getAvailableDimensions(dataset: string): string[];
  executeQuery(intent: ChartIntent): ChartData;
}
```

The first three methods tell the LLM what's queryable. The last one runs the actual query and returns Chart.js-compatible data.

### 🤖 LLM Provider

This server uses OpenAI (`src/lib/llm.ts`). To use a different LLM, implement the `LLMProvider` interface:

```typescript
interface LLMProvider {
  generateIntent(prompt: string, context: IntentContext): Promise<ChartIntent>;
}
```

The method receives the user's prompt plus context (available datasets, metrics, dimensions) and must return a parsed `ChartIntent`. See `OpenAIProvider` in `src/lib/llm.ts` for an example implementation.

### ⚙️ How It Works

<img width="2562" height="808" alt="architecture" src="https://github.com/user-attachments/assets/8b62da40-2260-4053-a077-bae62a956ba5" />

1. [prompt-chart](https://www.npmjs.com/package/prompt-chart) component sends a natural language prompt (e.g., "Show sales by region")
2. Backend sends the prompt to an LLM to generate structured intent
3. A data adapter executes the query against your data source
4. Chart-ready data is returned and rendered
