# prompt-chart-react

React wrapper for the [prompt-chart](https://github.com/OvidijusParsiunas/prompt-chart) web component - an LLM-driven chart generation component.

## Installation

```bash
npm install prompt-chart-react
```

## Usage

```tsx
import {PromptChart} from 'prompt-chart-react';

function App() {
  return (
    <PromptChart
      endpoint="http://localhost:3000/api/chart"
      prompt="Show monthly sales for 2024"
      autoFetch={true}
      onChartLoaded={(e) => console.log('Chart loaded:', e.detail)}
      onChartError={(e) => console.error('Chart error:', e.detail)}
    />
  );
}
```

### Demo Mode

For testing without a backend:

```tsx
<PromptChart
  prompt="Show quarterly revenue by region"
  demo={true}
  autoFetch={true}
/>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `endpoint` | `string` | URL of the backend API endpoint |
| `prompt` | `string` | Natural language prompt describing the desired chart |
| `autoFetch` | `boolean` | Automatically fetch chart when prompt changes |
| `demo` | `boolean` | Enable demo mode with generated mock data |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `onChartLoaded` | `ChartResponse` | Fired when chart is successfully generated |
| `onChartError` | `{error: string}` | Fired when an error occurs |

## Local Development

```bash
# Install dependencies
npm install

# Build the wrapper
npm run build
```

## License

MIT
