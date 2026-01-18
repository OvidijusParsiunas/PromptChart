# PromptChart

Turn natural language into validated data queries and charts.

PromptChart is an open-source, framework-agnostic system that converts natural language prompts into safe, on-demand data visualizations.

## How It Works

```
User Prompt → LLM → Validated JSON Intent → Data Adapter → Chart
```

1. **User describes what they want** in natural language
2. **LLM translates intent** into a strict, schema-validated JSON specification
3. **Backend resolves data** via pluggable adapters (mock, SQL, API, etc.)
4. **Frontend renders charts** using Chart.js

The LLM never accesses databases directly, writes SQL, or generates code. All execution is deterministic and controlled.

## Project Structure

```
promptchart/
├── component/              # Web component (npm: prompt-chart)
│   └── src/
│       └── prompt-chart.ts
│
└── examples/
    └── node-express/       # Complete Node.js example
        ├── index.html      # Demo page
        ├── server/         # Express backend (everything included)
        └── README.md
```

## Quick Start

### 1. Build the Component

```bash
cd component
npm install
npm run build
```

### 2. Run an Example

```bash
cd examples/node-express/server
npm install

# Add your OpenAI API key
cp .env.example .env
# Edit .env and add OPENAI_API_KEY

# Start the server
npm run dev
```

### 3. Open the Demo

Open `examples/node-express/index.html` in your browser and try:

- "Show monthly sales by region"
- "User signups trend as a line chart"
- "Product revenue breakdown as a pie chart"

## Web Component Usage

```html
<!-- Include the component -->
<script type="module" src="path/to/prompt-chart.js"></script>

<!-- Use it -->
<prompt-chart endpoint="http://localhost:3000/api/chart" prompt="Show monthly sales" auto-fetch></prompt-chart>
```

### Attributes

| Attribute    | Description                             |
| ------------ | --------------------------------------- |
| `endpoint`   | Backend API URL                         |
| `prompt`     | Natural language chart description      |
| `auto-fetch` | Automatically fetch when prompt changes |

### Events

| Event          | Detail                                |
| -------------- | ------------------------------------- |
| `chart-loaded` | Fired when chart renders successfully |
| `chart-error`  | Fired on error                        |

### JavaScript API

```javascript
const chart = document.querySelector('prompt-chart');

// Set prompt and fetch
chart.prompt = 'Show sales by category';
await chart.fetchChart();

// Listen for events
chart.addEventListener('chart-loaded', (e) => {
  console.log('Chart data:', e.detail);
});
```

## API Reference

### POST /api/chart

Generate a chart from a natural language prompt.

**Request:**

```json
{
  "prompt": "Show monthly sales by region",
  "context": {}
}
```

**Response:**

```json
{
  "chartSpec": {
    "type": "bar",
    "title": "Monthly Sales by Region",
    "xAxis": {"label": "month"},
    "yAxis": {"label": "sum(amount)"}
  },
  "data": {
    "labels": ["Jan", "Feb", "Mar"],
    "datasets": [
      {
        "label": "North",
        "data": [45000, 52000, 48000]
      }
    ]
  },
  "metadata": {
    "generatedAt": "2024-01-15T10:30:00Z",
    "dataset": "sales",
    "recordCount": 12
  }
}
```

## Intent Schema

The LLM outputs a validated JSON structure:

```json
{
  "dataset": "sales",
  "metrics": [{"field": "amount", "aggregation": "sum"}],
  "dimensions": [{"field": "month"}],
  "filters": [{"field": "year", "operator": "eq", "value": 2024}],
  "chartType": "bar",
  "title": "Monthly Sales"
}
```

All fields are enum-based and validated against a strict JSON Schema.

## Creating Your Own Backend

Each example contains a complete backend. To create your own:

1. Copy an example (e.g., `examples/node-express/`)
2. Implement the `DataAdapter` interface to connect your data source
3. Optionally swap the `LLMProvider` for a different LLM

### DataAdapter Interface

```typescript
interface DataAdapter {
  getAvailableDatasets(): Dataset[];
  getAvailableMetrics(dataset: Dataset): string[];
  getAvailableDimensions(dataset: Dataset): string[];
  executeQuery(intent: ChartIntent): Promise<ChartData>;
}
```

### LLMProvider Interface

```typescript
interface LLMProvider {
  generateIntent(prompt: string, context: IntentContext): Promise<IntentResult>;
}
```

## Design Principles

- **Safe by default** - LLM output is always validated against strict schemas
- **No SQL generation** - Data access is through controlled adapters
- **Framework agnostic** - Works with any frontend framework
- **Self-contained examples** - Each example has everything you need
- **Self-hostable** - Run entirely on your own infrastructure

## License

MIT
