# Node.js + Express Example

A complete example showing how to use PromptChart with a Node.js/Express backend.

## What's Included

```
node-express/
├── index.html          # Demo page using the web component
├── server/             # Complete Express backend
│   ├── src/
│   │   ├── adapters/   # Data adapters (mock data)
│   │   ├── llm/        # OpenAI integration
│   │   ├── routes/     # API endpoints
│   │   ├── services/   # Intent resolver
│   │   ├── types/      # TypeScript types
│   │   └── validation/ # Schema validation
│   ├── schemas/        # JSON schemas for validation
│   └── package.json
└── README.md
```

## Setup

### 1. Build the Component

First, build the web component (from the repo root):

```bash
cd ../../component
npm install
npm run build
```

### 2. Start the Server

```bash
cd server
npm install

# Add your OpenAI API key
cp .env.example .env
# Edit .env and add OPENAI_API_KEY

# Start the server
npm run dev
```

### 3. Open the Demo

Open `index.html` in your browser.

## API Endpoints

- `POST /api/chart` - Generate a chart from a prompt
- `GET /api/chart/datasets` - List available datasets
- `GET /health` - Health check

## Example Request

```bash
curl -X POST http://localhost:3000/api/chart \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Show monthly sales by region"}'
```

## Available Datasets

The mock adapter includes:
- **sales** - Monthly sales with regions and categories
- **users** - User signups and activity
- **products** - Product revenue and profit
- **orders** - Order status and amounts
- **inventory** - Stock levels
