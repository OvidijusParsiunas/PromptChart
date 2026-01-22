## .NET + ASP.NET Core Backend Example

A complete ASP.NET Core Web API backend for PromptChart that converts natural language prompts into chart specifications using OpenAI.

### 🚀 Quick Start

Get running in 3 commands:

```bash
dotnet restore
cp .env.example .env   # Add your OPENAI_API_KEY
source .env && dotnet run
```

That's it. Your server is live at `http://localhost:3000`.

### 🖥️ Using with the UI

This backend is designed to work with the [UI example](../ui/README.md) which calls the `http://localhost:3000/api/chart` endpoint.

### 🔌 Add to existing server

**1. Install the OpenAI package:**

```bash
dotnet add package OpenAI
```

**2. Copy these files to your project:**

```
src/Models/ChartModels.cs
src/Services/DataAdapter.cs      # or write your own
src/Services/LLMProvider.cs
src/Services/IntentResolver.cs
src/Controllers/ChartController.cs
```

**3. Register services in your `Program.cs`:**

```csharp
var apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY") ?? "";

builder.Services.AddSingleton<IDataAdapter, MockDataAdapter>();  // Swap for your real data
builder.Services.AddSingleton<ILLMProvider>(new OpenAIProvider(apiKey));
builder.Services.AddSingleton<IIntentResolver, IntentResolver>();
```

Done. Your app now has a `POST /api/chart` endpoint.

### 🗄️ Data Adapter

This server uses a mock adapter (`src/Services/DataAdapter.cs`). To connect your own data, implement the `IDataAdapter` interface:

```csharp
public interface IDataAdapter
{
    List<string> GetAvailableDatasets();
    List<string> GetAvailableMetrics(string dataset);
    List<string> GetAvailableDimensions(string dataset);
    ChartData ExecuteQuery(ChartIntent intent);
}
```

The first three methods tell the LLM what's queryable. The last one runs the actual query and returns Chart.js-compatible data.

### 🤖 LLM Provider

This server uses OpenAI (`src/Services/LLMProvider.cs`). To use a different LLM, implement the `ILLMProvider` interface:

```csharp
public interface ILLMProvider
{
    Task<ChartIntent> GenerateIntentAsync(string prompt, IntentContext context);
}
```

The method receives the user's prompt plus context (available datasets, metrics, dimensions) and must return a parsed `ChartIntent`. See `OpenAIProvider` in `src/Services/LLMProvider.cs` for an example implementation.

### ⚙️ How It Works

<img width="2562" height="808" alt="architecture" src="https://github.com/user-attachments/assets/8b62da40-2260-4053-a077-bae62a956ba5" />

1. [prompt-chart](https://www.npmjs.com/package/prompt-chart) component sends a natural language prompt (e.g., "Show sales by region")
2. Backend sends the prompt to an LLM to generate structured intent
3. A data adapter executes the query against your data source
4. Chart-ready data is returned and rendered
