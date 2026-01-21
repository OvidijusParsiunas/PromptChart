## Java + Spring Boot Backend Example

A complete Spring Boot backend for PromptChart that converts natural language prompts into chart specifications using OpenAI.

### 🚀 Quick Start

Get running in 3 commands:

```bash
cp .env.example .env   # Add your OPENAI_API_KEY
source .env
./mvnw spring-boot:run
```

That's it. Your server is live at `http://localhost:3000`.

### 🖥️ Using with the UI

This backend is designed to work with the [UI example](../../ui/README.md) which calls the `http://localhost:3000/api/chart` endpoint.

### 🔌 Add to existing Spring Boot app

**1. Add dependencies to pom.xml:**

```xml
<dependency>
    <groupId>com.theokanning.openai-gpt3-java</groupId>
    <artifactId>service</artifactId>
    <version>0.18.2</version>
</dependency>
```

**2. Copy these packages to your project:**

```
model/
adapter/         # or write your own
llm/
service/
controller/
```

**3. Add config to application.properties:**

```properties
openai.api-key=${OPENAI_API_KEY:}
openai.model=${OPENAI_MODEL:gpt-4o-mini}
```

Done. Your app now has a `POST /api/chart` endpoint.

### 🗄️ Data Adapter

This server uses a mock adapter (`MockDataAdapter.java`). To connect your own data, implement the `DataAdapter` interface:

```java
public interface DataAdapter {
    List<String> getAvailableDatasets();
    List<String> getAvailableMetrics(String dataset);
    List<String> getAvailableDimensions(String dataset);
    ChartData executeQuery(ChartIntent intent);
}
```

The first three methods tell the LLM what's queryable. The last one runs the actual query and returns Chart.js-compatible data.

### 🤖 LLM Provider

This server uses OpenAI (`OpenAIProvider.java`). To use a different LLM, implement the `LLMProvider` interface:

```java
public interface LLMProvider {
    ChartIntent generateIntent(String prompt, Map<String, Map<String, List<String>>> datasets, List<String> chartTypes);
}
```

The method receives the user's prompt plus context (available datasets, metrics, dimensions) and must return a parsed `ChartIntent`. See `OpenAIProvider` in `llm/OpenAIProvider.java` for an example implementation.

### ⚙️ How It Works

<img width="2562" height="808" alt="architecture" src="https://github.com/user-attachments/assets/8b62da40-2260-4053-a077-bae62a956ba5" />

1. `prompt-chart` component sends a natural language prompt (e.g., "Show sales by region")
2. Backend sends the prompt to an LLM to generate structured intent
3. A data adapter executes the query against your data source
4. Chart-ready data is returned and rendered
