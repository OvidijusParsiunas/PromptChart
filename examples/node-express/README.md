# Node.js + Express Backend Example

A complete Express backend for PromptChart that converts natural language prompts into chart specifications using OpenAI.

## Structure

```
node-express/
├── src/
│   ├── adapters/       # Data adapters (mock data)
│   ├── llm/            # OpenAI integration
│   ├── routes/         # API endpoints
│   ├── services/       # Intent resolver
│   ├── types/          # TypeScript types
│   ├── validation/     # Schema validation
│   └── index.ts        # Server entry point
├── schemas/            # JSON schemas for validation
├── package.json
├── tsconfig.json
└── .env.example
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### 3. Start the Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

The server runs on `http://localhost:3000` by default.

## API Endpoints

### Generate Chart

```
POST /api/chart
```

Generate a chart from a natural language prompt.

**Request:**
```json
{
  "prompt": "Show monthly sales by region as a bar chart"
}
```

**Response:**
```json
{
  "chartSpec": {
    "type": "bar",
    "title": "Monthly Sales by Region",
    "xAxis": { "label": "region" },
    "yAxis": { "label": "sum(amount)" },
    "legend": { "position": "top", "display": true }
  },
  "data": {
    "labels": ["North", "South"],
    "datasets": [...]
  },
  "metadata": {
    "generatedAt": "2024-01-15T10:30:00.000Z",
    "dataset": "sales",
    "recordCount": 2
  }
}
```

### List Datasets

```
GET /api/chart/datasets
```

Returns available datasets.

### Health Check

```
GET /health
```

Returns server health status.

## Example Requests

```bash
# Generate a chart
curl -X POST http://localhost:3000/api/chart \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Show monthly sales by region"}'

# List datasets
curl http://localhost:3000/api/chart/datasets

# Health check
curl http://localhost:3000/health
```

## Available Datasets

The mock adapter includes:

- **sales** - Monthly sales with regions and categories
- **users** - User signups and activity
- **products** - Product revenue and profit
- **orders** - Order status and amounts
- **inventory** - Stock levels

## Using with the UI Example

This backend is designed to work with the React UI example in `../ui/`.

1. Start this backend server on port 3000
2. Start the UI example on port 3001 (or any other port)
3. The UI will call `http://localhost:3000/api/chart`

See `../ui/README.md` for UI setup instructions.
