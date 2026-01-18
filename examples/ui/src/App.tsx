import {PromptChart as PromptChartCore} from 'prompt-chart';
import {useState, useRef, useEffect} from 'react';
import {PromptChart} from 'prompt-chart-react';
import './App.css';

const EXAMPLE_PROMPTS = [
  'Monthly sales by region',
  'User signups trend this year',
  'Product revenue as a pie chart',
  'Orders by status',
  'Top 5 products by profit',
];

function App() {
  const [prompt, setPrompt] = useState('Show monthly sales by region as a bar chart');
  const [isGenerating, setIsGenerating] = useState(false);
  const [metadata, setMetadata] = useState<{dataset?: string; recordCount?: number; generatedAt?: string} | null>(null);
  const chartRef = useRef<PromptChartCore | null>(null);

  // Set up callbacks on the chart element
  useEffect(() => {
    const chartElement = chartRef.current;
    if (!chartElement) return;

    chartElement.onChartLoaded = () => {
      setIsGenerating(false);
    };

    chartElement.onChartError = () => {
      setIsGenerating(false);
    };
  }, []);

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setMetadata(null);

    const chartElement = chartRef.current;
    if (chartElement) {
      chartElement.prompt = prompt;
      chartElement.fetchChart();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
    setIsGenerating(true);
    setMetadata(null);

    const chartElement = chartRef.current;
    if (chartElement) {
      chartElement.prompt = examplePrompt;
      chartElement.fetchChart();
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>PromptChart</h1>
        <p className="subtitle">Turn natural language into charts</p>
      </header>

      <section className="input-section">
        <div className="input-group">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the chart you want to see..."
            className="prompt-input"
          />
          <button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="generate-button">
            {isGenerating ? 'Generating...' : 'Generate Chart'}
          </button>
        </div>

        <div className="examples">
          <span className="examples-label">Try these examples:</span>
          <div className="example-prompts">
            {EXAMPLE_PROMPTS.map((example) => (
              <button key={example} className="example-prompt" onClick={() => handleExampleClick(example)}>
                {example}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="chart-section">
        <PromptChart ref={chartRef} endpoint="http://localhost:3000/api/chart" />

        {metadata && (
          <div className="metadata">
            <span className="metadata-item">
              <span className="metadata-label">Dataset:</span> {metadata.dataset || '-'}
            </span>
            <span className="metadata-item">
              <span className="metadata-label">Records:</span> {metadata.recordCount || '-'}
            </span>
            <span className="metadata-item">
              <span className="metadata-label">Generated:</span>{' '}
              {metadata.generatedAt ? new Date(metadata.generatedAt).toLocaleTimeString() : '-'}
            </span>
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
