## Python + Flask Backend Example

A complete Flask backend for PromptChart that converts natural language prompts into chart specifications using OpenAI.

### 🚀 Quick Start

Get running in 4 commands:

```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # Add your OPENAI_API_KEY
python -m src.app
```

That's it. Your server is live at `http://localhost:3000`.

### 🖥️ Using with the UI

This backend is designed to work with the [UI example](../../ui/README.md) which calls the `http://localhost:3000/api/chart` endpoint.

### 🔌 Add to existing server

**1. Install dependencies:**

```bash
pip install openai python-dotenv
```

**2. Copy these files to your project:**

```
src/llm.py
src/adapters.py      # or write your own
src/intent_resolver.py
src/types.py
src/routes.py
```

**3. Register the blueprint in your Flask app (e.g., `app.py`):**

```python
import os
from src.llm import OpenAIProvider, LLMConfig
from src.adapters import MockDataAdapter  # Replace with your adapter
from src.intent_resolver import IntentResolver
from src.routes import create_chart_blueprint

llm_provider = OpenAIProvider(LLMConfig(api_key=os.getenv("OPENAI_API_KEY")))
data_adapter = MockDataAdapter()  # Swap for your real data
intent_resolver = IntentResolver(llm_provider, data_adapter)

app.register_blueprint(create_chart_blueprint(intent_resolver), url_prefix="/api/chart")
```

Done. Your app now has a `POST /api/chart` endpoint.

### 🗄️ Data Adapter

This server uses a mock adapter (`src/adapters.py`). To connect your own data, implement the `DataAdapter` interface:

```python
class DataAdapter(ABC):
    def get_available_datasets(self) -> list[str]: ...
    def get_available_metrics(self, dataset: str) -> list[str]: ...
    def get_available_dimensions(self, dataset: str) -> list[str]: ...
    def execute_query(self, intent: ChartIntent) -> ChartData: ...
```

The first three methods tell the LLM what's queryable. The last one runs the actual query and returns Chart.js-compatible data.

### 🤖 LLM Provider

This server uses OpenAI (`src/llm.py`). To use a different LLM, implement the `LLMProvider` interface:

```python
class LLMProvider(ABC):
    def generate_intent(self, prompt: str, context: IntentContext) -> IntentResult: ...
```

The method receives the user's prompt plus context (available datasets, metrics, dimensions) and must return a parsed `ChartIntent`. See `OpenAIProvider` in `src/llm.py` for an example implementation.
