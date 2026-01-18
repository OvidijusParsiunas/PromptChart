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
    └── node/
      └── express/       # Complete Node.js example
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
cd examples/node/express/server
npm install

# Add your OpenAI API key
cp .env.example .env
# Edit .env and add OPENAI_API_KEY

# Start the server
npm run dev
```

### 3. Open the Demo

Open `examples/node/express/index.html` in your browser and try:

- "Show monthly sales by region"
- "User signups trend as a line chart"
- "Product revenue breakdown as a pie chart"

## Web Component Usage

```html
<!-- Include the component -->
<script type="module" src="path/to/prompt-chart.js"></script>

<!-- Use it -->
<prompt-chart prompt="Show monthly sales"></prompt-chart>

<script>
  document.querySelector('prompt-chart').connect = {
    url: 'http://localhost:3000/api/chart',
    method: 'POST',
    headers: {Authorization: 'Bearer token'},
  };
</script>
```

### Properties

| Property              | Type       | Description                                     |
| --------------------- | ---------- | ----------------------------------------------- |
| `connect`             | `object`   | Connection config: `{ url, method?, headers? }` |
| `prompt`              | `string`   | Natural language chart description              |
| `autoFetch`           | `boolean`  | Automatically fetch when prompt changes         |
| `data`                | `object`   | Directly set chart data (bypasses fetch)        |
| `demo`                | `boolean`  | Use demo mode with generated data               |
| `stateText`           | `object`   | Custom text: `{ empty?, loading?, retry? }`     |
| `containerStyle`      | `object`   | Custom CSS styles for the container             |
| `requestInterceptor`  | `function` | Modify request before sending                   |
| `responseInterceptor` | `function` | Transform response before rendering             |

### Events & Callbacks

| Event/Callback  | Description                    |
| --------------- | ------------------------------ |
| `chart-loaded`  | Event fired when chart renders |
| `chart-error`   | Event fired on error           |
| `onChartLoaded` | Callback when chart renders    |
| `onChartError`  | Callback on error              |

### JavaScript API

```javascript
const chart = document.querySelector('prompt-chart');

// Configure connection
chart.connect = {url: 'http://localhost:3000/api/chart'};

// Set prompt and fetch
chart.prompt = 'Show sales by category';
await chart.fetchChart();

// Use callbacks
chart.onChartLoaded = (data) => {
  console.log('Chart data:', data);
};

// Or listen for events
chart.addEventListener('chart-loaded', (e) => {
  console.log('Chart data:', e.detail);
});

// Use interceptors
chart.requestInterceptor = (request) => {
  request.headers['X-Custom-Header'] = 'value';
  return request;
};

chart.responseInterceptor = (response) => {
  // Transform response if needed
  return response;
};
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

1. Copy an example (e.g., `examples/node/express/`)
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
