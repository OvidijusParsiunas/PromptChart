'use client';

import {useState, useRef, useEffect, useCallback} from 'react';
import dynamic from 'next/dynamic';
import type {PromptChart as PromptChartType} from 'prompt-chart';

const PromptChart = dynamic(() => import('prompt-chart-react').then((mod) => mod.PromptChart), {
  ssr: false,
});

const EXAMPLE_PROMPTS = [
  'Monthly sales by region',
  'User signups trend this year',
  'Product revenue as a pie chart',
  'Orders by status',
  'Top 5 products by profit',
];

export default function Home() {
  const [prompt, setPrompt] = useState('Show monthly sales by region as a bar chart');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const getChartElement = useCallback((): PromptChartType | null => {
    return containerRef.current?.querySelector('prompt-chart') as PromptChartType | null;
  }, []);

  // Set up callbacks when the chart element becomes available
  useEffect(() => {
    if (!isLoaded) return;

    const setupCallbacks = () => {
      const element = getChartElement();
      if (element) {
        element.onChartLoaded = () => setIsGenerating(false);
        element.onChartError = () => setIsGenerating(false);
        return true;
      }
      return false;
    };

    // Try immediately, then retry a few times
    if (!setupCallbacks()) {
      const interval = setInterval(() => {
        if (setupCallbacks()) {
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isLoaded, getChartElement]);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    const chartElement = getChartElement();
    if (!chartElement) return;

    setIsGenerating(true);
    chartElement.prompt = prompt;
    chartElement.fetchChart();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleGenerate();
  };

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
    const chartElement = getChartElement();
    if (!chartElement) return;

    setIsGenerating(true);
    chartElement.prompt = examplePrompt;
    chartElement.fetchChart();
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>PromptChart</h1>
        <p style={styles.subtitle}>Turn natural language into charts</p>
      </header>

      <section style={styles.inputSection}>
        <div style={styles.inputGroup}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the chart you want to see..."
            style={styles.input}
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            style={{
              ...styles.button,
              ...(isGenerating || !prompt.trim() ? styles.buttonDisabled : {}),
            }}
          >
            {isGenerating ? 'Generating...' : 'Generate Chart'}
          </button>
        </div>

        <div style={styles.examples}>
          <span style={styles.examplesLabel}>Try these examples:</span>
          <div style={styles.examplePrompts}>
            {EXAMPLE_PROMPTS.map((example) => (
              <button key={example} style={styles.exampleButton} onClick={() => handleExampleClick(example)}>
                {example}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section style={styles.chartSection} ref={containerRef}>
        {isLoaded && <PromptChart connect={{url: '/api/chart'}} />}
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    maxWidth: 1200,
    margin: '0 auto',
    padding: '40px 20px',
    minHeight: '100vh',
    background: '#f9fafb',
  },
  header: {marginBottom: 32},
  title: {color: '#111827', margin: '0 0 8px 0', fontSize: '2rem'},
  subtitle: {color: '#6b7280', margin: 0, fontSize: '1rem'},
  inputSection: {
    background: 'white',
    padding: 24,
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: 24,
  },
  inputGroup: {display: 'flex', gap: 12},
  input: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    fontSize: 16,
    outline: 'none',
  },
  button: {
    padding: '12px 24px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    fontSize: 16,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  buttonDisabled: {background: '#9ca3af', cursor: 'not-allowed'},
  examples: {marginTop: 16},
  examplesLabel: {fontSize: 14, color: '#6b7280', marginRight: 12},
  examplePrompts: {display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8},
  exampleButton: {
    padding: '6px 12px',
    background: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    fontSize: 13,
    color: '#374151',
    cursor: 'pointer',
  },
  chartSection: {
    background: 'white',
    padding: 24,
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    minHeight: 400,
  },
};
