## SvelteKit Example

A full-stack SvelteKit example with integrated backend API and [prompt-chart](https://www.npmjs.com/package/prompt-chart) web component.

### 🚀 Quick Start

```bash
npm install
cp .env.example .env   # Add your OPENAI_API_KEY
npm run dev
```

That's it. Open `http://localhost:5173`.

### 📦 Using prompt-chart in SvelteKit

**1. Install the package:**

```bash
npm install prompt-chart
```

**2. Import and use in your component:**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import type { PromptChart } from 'prompt-chart';

  let chartElement: PromptChart | null = null;

  onMount(async () => {
    await import('prompt-chart');
  });

  function generateChart(): void {
    if (chartElement) {
      chartElement.prompt = 'Show monthly sales';
      chartElement.fetchChart();
    }
  }
</script>

<prompt-chart
  bind:this={chartElement}
  connect={{ url: '/api/chart' }}
></prompt-chart>
```

**Key Points:**

- Import `prompt-chart` dynamically in `onMount` (web components need browser APIs)
- Use `bind:this` to get a reference to the element
- Set `prompt` and call `fetchChart()` to generate charts

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
