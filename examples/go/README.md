## Go Backend Example

A complete Go backend for PromptChart that converts natural language prompts into chart specifications using OpenAI.

### 🚀 Quick Start

Get running in 3 commands:

```bash
go mod tidy
cp .env.example .env   # Add your OPENAI_API_KEY
source .env && go run .
```

That's it. Your server is live at `http://localhost:3000`.

### 🖥️ Using with the UI

This backend is designed to work with the [UI example](../ui/README.md) which calls the `http://localhost:3000/api/chart` endpoint.

### 🔌 Add to existing server

**1. Install the OpenAI package:**

```bash
go get github.com/sashabaranov/go-openai
```

**2. Copy these files to your project:**

```
types.go
adapters.go      # or write your own
llm.go
resolver.go
handlers.go
```

**3. Register the handlers in your server:**

```go
llmProvider := NewOpenAIProvider(LLMConfig{APIKey: os.Getenv("OPENAI_API_KEY")})
dataAdapter := &MockDataAdapter{}  // Swap for your real data
resolver := NewIntentResolver(llmProvider, dataAdapter)
handlers := NewHandlers(resolver)

mux.HandleFunc("/api/chart", handlers.ChartHandler)
```

Done. Your app now has a `POST /api/chart` endpoint.

### 🗄️ Data Adapter

This server uses a mock adapter (`adapters.go`). To connect your own data, implement the `DataAdapter` interface:

```go
type DataAdapter interface {
    GetAvailableDatasets() []string
    GetAvailableMetrics(dataset string) []string
    GetAvailableDimensions(dataset string) []string
    ExecuteQuery(intent ChartIntent) (ChartData, error)
}
```

The first three methods tell the LLM what's queryable. The last one runs the actual query and returns Chart.js-compatible data.

### 🤖 LLM Provider

This server uses OpenAI (`llm.go`). To use a different LLM, implement the `LLMProvider` interface:

```go
type LLMProvider interface {
    GenerateIntent(ctx context.Context, prompt string, intentCtx IntentContext) (ChartIntent, error)
}
```

The method receives the user's prompt plus context (available datasets, metrics, dimensions) and must return a parsed `ChartIntent`. See `OpenAIProvider` in `llm.go` for an example implementation.

### ⚙️ How It Works

<img width="2562" height="808" alt="architecture" src="https://github.com/user-attachments/assets/8b62da40-2260-4053-a077-bae62a956ba5" />

1. `prompt-chart` component sends a natural language prompt (e.g., "Show sales by region")
2. Backend sends the prompt to an LLM to generate structured intent
3. A data adapter executes the query against your data source
4. Chart-ready data is returned and rendered
