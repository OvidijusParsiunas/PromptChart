# React UI Example

A React application demonstrating the PromptChart component for generating charts from natural language prompts.

## Prerequisites

Before running this example, make sure you have:

1. Built the core component in `../../component/`
2. Built the React wrapper in `../../other-packages/react/`
3. Started the backend server in `../node-express/`

## Setup

### 1. Build Dependencies

From the repository root:

```bash
# Build the core web component
cd component
npm install
npm run build

# Build the React wrapper
cd ../other-packages/react
npm install
npm run build
```

### 2. Install UI Dependencies

```bash
cd examples/ui
npm install
```

### 3. Start the Backend

In a separate terminal:

```bash
cd examples/node-express
npm install
cp .env.example .env
# Add your OPENAI_API_KEY to .env
npm run dev
```

The backend runs on `http://localhost:3000`.

### 4. Start the UI

```bash
npm start
```

The UI runs on `http://localhost:3001` (or the next available port).

## Usage

1. Enter a natural language prompt describing the chart you want
2. Click "Generate Chart" or press Enter
3. The chart will be generated using the backend API

### Example Prompts

- "Monthly sales by region"
- "User signups trend this year"
- "Product revenue as a pie chart"
- "Orders by status"
- "Top 5 products by profit"

## Project Structure

```
ui/
├── src/
│   ├── App.tsx         # Main application component
│   ├── App.css         # Application styles
│   ├── index.tsx       # Entry point
│   └── index.css       # Global styles
├── public/
└── package.json
```

## Configuration

The UI connects to the backend at `http://localhost:3000/api/chart`. To change this, update the `endpoint` prop in `App.tsx`:

```tsx
<PromptChart
  ref={chartRef}
  endpoint="http://your-backend-url/api/chart"
  // ...
/>
```

## Troubleshooting

### Chart not loading
- Make sure the backend server is running on port 3000
- Check the browser console for CORS errors
- Verify your OpenAI API key is set in the backend `.env` file

### Build errors
- Ensure you've built both the core component and React wrapper
- Try removing `node_modules` and reinstalling: `rm -rf node_modules && npm install`
