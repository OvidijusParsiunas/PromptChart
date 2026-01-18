import {ChartRenderer, type ChartResponse} from './chartRenderer.js';
import {InternalHTML} from './utils/webComponent/internalHTML.js';
import {Property} from './utils/decorators/property.js';
import {styles} from './styles.js';

/**
 * PromptChart Web Component
 *
 * A custom element that converts natural language prompts into charts.
 *
 * @example
 * ```html
 * <prompt-chart
 *   endpoint="http://localhost:3000/api/chart"
 *   prompt="Show monthly sales for 2024"
 * ></prompt-chart>
 * ```
 */
export class PromptChart extends InternalHTML {
  @Property('string')
  endpoint?: string;

  @Property('string')
  prompt?: string;

  @Property('boolean')
  autoFetch?: boolean;

  @Property('function')
  onChartLoaded?: () => void;

  @Property('function')
  onChartError?: () => void;

  @Property('boolean')
  demo?: boolean;

  private _shadow: ShadowRoot;
  private _renderer: ChartRenderer | null = null;
  private _abortController: AbortController | null = null;
  private _container: HTMLDivElement;

  constructor() {
    super();
    this._shadow = this.attachShadow({mode: 'open'});
    this._container = document.createElement('div');
    this._container.className = 'prompt-chart-container';
    this._shadow.innerHTML = `<style>${styles}</style>`;
    this._shadow.appendChild(this._container);
    this._renderEmptyState();
  }

  connectedCallback(): void {
    if (this.autoFetch && this.prompt && (this.endpoint || this.demo)) {
      this.fetchChart();
    }
  }

  disconnectedCallback(): void {
    this._cleanup();
  }

  override onPropertyChange(property: string, _value: unknown): void {
    if (property === 'prompt' && this.autoFetch && this.prompt && (this.endpoint || this.demo)) {
      this.fetchChart();
    }
  }

  /**
   * Fetch and render a chart based on the current prompt
   */
  async fetchChart(): Promise<void> {
    if (!this.prompt) {
      this._showError('Missing prompt');
      return;
    }

    if (!this.demo && !this.endpoint) {
      this._showError('Missing endpoint');
      return;
    }

    // Demo mode: generate mock chart data
    if (this.demo) {
      this._showLoading();

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const data = this._generateDemoData(this.prompt);
      this._renderChart(data);

      this.dispatchEvent(new CustomEvent('chart-loaded', {detail: data, bubbles: true, composed: true}));
      this.onChartLoaded?.();
      return;
    }

    // Cancel any pending request
    this._abortController?.abort();
    this._abortController = new AbortController();

    this._showLoading();

    try {
      const response = await fetch(this.endpoint!, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({prompt: this.prompt}),
        signal: this._abortController.signal,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({error: 'Request failed'}));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const data: ChartResponse = await response.json();
      this._renderChart(data);

      // Dispatch success event
      this.dispatchEvent(new CustomEvent('chart-loaded', {detail: data, bubbles: true, composed: true}));
      this.onChartLoaded?.();
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled
      }

      const message = err instanceof Error ? err.message : 'Unknown error';
      this._showError(message);

      // Dispatch error event
      this.dispatchEvent(new CustomEvent('chart-error', {detail: {error: message}, bubbles: true, composed: true}));
      this.onChartError?.();
    }
  }

  private _renderEmptyState(): void {
    this._container.innerHTML = `
      <div class="empty-state">
        <span>Set a prompt to generate a chart</span>
      </div>
    `;
  }

  private _showLoading(): void {
    this._container.innerHTML = `
      <div class="loading-overlay">
        <div class="spinner"></div>
        <div class="loading-text">Generating chart...</div>
      </div>
      <div class="chart-wrapper">
        <canvas></canvas>
      </div>
    `;
  }

  private _showError(message: string): void {
    this._container.innerHTML = `
      <div class="error-container">
        <div class="error-icon">!</div>
        <div class="error-message">${this._escapeHtml(message)}</div>
        <button class="retry-button">Retry</button>
      </div>
    `;

    const retryButton = this._container.querySelector('.retry-button');
    retryButton?.addEventListener('click', () => this.fetchChart());
  }

  private _renderChart(response: ChartResponse): void {
    this._container.innerHTML = `
      <div class="chart-wrapper">
        <canvas></canvas>
      </div>
    `;

    const canvas = this._container.querySelector('canvas');
    if (!canvas) return;

    this._renderer?.destroy();
    this._renderer = new ChartRenderer(canvas);
    this._renderer.render(response);
  }

  private _generateDemoData(prompt: string): ChartResponse {
    const lowerPrompt = prompt.toLowerCase();

    // Detect chart type from prompt
    let chartType = 'bar';
    if (lowerPrompt.includes('pie')) chartType = 'pie';
    else if (lowerPrompt.includes('doughnut') || lowerPrompt.includes('donut')) chartType = 'doughnut';
    else if (lowerPrompt.includes('line') || lowerPrompt.includes('trend')) chartType = 'line';
    else if (lowerPrompt.includes('area')) chartType = 'area';
    else if (lowerPrompt.includes('scatter')) chartType = 'scatter';

    // Generate title from prompt
    const title = prompt.charAt(0).toUpperCase() + prompt.slice(1);

    // Demo data presets based on keywords
    let labels: string[];
    let datasets: ChartResponse['data']['datasets'];
    let dataset = 'demo_data';

    if (lowerPrompt.includes('month') || lowerPrompt.includes('year')) {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      if (lowerPrompt.includes('region')) {
        datasets = [
          {
            label: 'North',
            data: [65, 78, 90, 81, 96, 105, 110, 102, 95, 88, 92, 108],
            backgroundColor: '#3b82f6',
            borderColor: '#3b82f6',
          },
          {
            label: 'South',
            data: [45, 52, 60, 55, 70, 82, 88, 80, 72, 65, 70, 85],
            backgroundColor: '#10b981',
            borderColor: '#10b981',
          },
          {
            label: 'East',
            data: [35, 40, 48, 45, 55, 62, 68, 60, 55, 50, 52, 65],
            backgroundColor: '#f59e0b',
            borderColor: '#f59e0b',
          },
        ];
        dataset = 'sales_by_region';
      } else {
        datasets = [
          {
            label: 'Value',
            data: [65, 78, 90, 81, 96, 105, 110, 102, 95, 88, 92, 108],
            backgroundColor: '#3b82f6',
            borderColor: '#3b82f6',
          },
        ];
        dataset = 'monthly_data';
      }
    } else if (lowerPrompt.includes('product') || lowerPrompt.includes('revenue')) {
      labels = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'];
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
      datasets = [
        {label: 'Revenue', data: [42000, 35000, 28000, 21000, 15000], backgroundColor: colors, borderColor: colors},
      ];
      dataset = 'product_revenue';
    } else if (lowerPrompt.includes('status') || lowerPrompt.includes('order')) {
      labels = ['Completed', 'Pending', 'Processing', 'Cancelled'];
      const colors = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'];
      datasets = [{label: 'Orders', data: [245, 89, 56, 23], backgroundColor: colors, borderColor: colors}];
      dataset = 'order_status';
    } else if (lowerPrompt.includes('signup') || lowerPrompt.includes('user')) {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      datasets = [
        {
          label: 'Signups',
          data: [120, 145, 180, 220, 290, 350, 420, 480, 520, 580, 650, 720],
          backgroundColor: '#8b5cf6',
          borderColor: '#8b5cf6',
        },
      ];
      dataset = 'user_signups';
      if (!lowerPrompt.includes('bar')) chartType = 'line';
    } else if (lowerPrompt.includes('profit') || lowerPrompt.includes('top')) {
      labels = ['Widget Pro', 'Gadget X', 'Tool Master', 'Device Plus', 'Smart Kit'];
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
      datasets = [
        {label: 'Profit', data: [18500, 15200, 12800, 9500, 7200], backgroundColor: colors, borderColor: colors},
      ];
      dataset = 'product_profit';
    } else {
      // Default demo data
      labels = ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'];
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
      datasets = [{label: 'Value', data: [42, 35, 28, 21, 15], backgroundColor: colors, borderColor: colors}];
    }

    return {
      chartSpec: {
        type: chartType,
        title,
        xAxis: {label: 'Category'},
        yAxis: {label: 'Value'},
        legend: {display: datasets.length > 1 || chartType === 'pie' || chartType === 'doughnut', position: 'top'},
      },
      data: {labels, datasets},
      metadata: {
        generatedAt: new Date().toISOString(),
        dataset,
        recordCount: labels.length,
      },
    };
  }

  private _cleanup(): void {
    this._abortController?.abort();
    this._renderer?.destroy();
    this._renderer = null;
  }

  private _escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Register the custom element
if (!customElements.get('prompt-chart')) {
  customElements.define('prompt-chart', PromptChart);
}

// TypeScript DOM mapping
declare global {
  interface HTMLElementTagNameMap {
    'prompt-chart': PromptChart;
  }
}

export {ChartRenderer, type ChartResponse};
