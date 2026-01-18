import {RequestInterceptor, ResponseInterceptor, RequestDetails} from './types/interceptors.js';
import {WebComponentStyleUtils} from './utils/webComponent/webComponentStyleUtils.js';
import {ChartResponseInput, ChartResponse} from './types/response.js';
import {InternalHTML} from './utils/webComponent/internalHTML.js';
import {GoogleFont} from './utils/webComponent/googleFont.js';
import {DemoDataGenerator} from './demoDataGenerator.js';
import {Property} from './utils/decorators/property.js';
import {ChartRenderer} from './chartRenderer.js';
import {StateRenderer} from './stateRenderer.js';
import {CustomStyle} from './types/style.js';
import {Connect} from './types/connect.js';
import {styles} from './styles.js';

/**
 * PromptChart Web Component
 *
 * A custom element that converts natural language prompts into charts.
 *
 * @example
 * ```html
 * <prompt-chart prompt="Show monthly sales for 2024"></prompt-chart>
 *
 * <script>
 *   document.querySelector('prompt-chart').connect = {
 *     url: 'http://localhost:3000/api/chart',
 *     method: 'POST',
 *     headers: { 'Authorization': 'Bearer token' }
 *   };
 * </script>
 * ```
 */
export class PromptChart extends InternalHTML {
  @Property('object')
  connect?: Connect;

  @Property('string')
  prompt?: string;

  @Property('boolean')
  autoFetch?: boolean;

  @Property('object')
  containerStyle?: CustomStyle;

  @Property('function')
  onChartLoaded?: (data: ChartResponseInput) => void;

  @Property('function')
  onChartError?: () => void;

  @Property('function')
  requestInterceptor?: RequestInterceptor;

  @Property('function')
  responseInterceptor?: ResponseInterceptor;

  @Property('boolean')
  demo?: boolean;

  @Property('object')
  data?: ChartResponseInput;

  _hasBeenRendered = false;

  private readonly _shadow: ShadowRoot;
  private readonly _stateRenderer: StateRenderer;
  private readonly _demoDataGenerator: DemoDataGenerator;
  private _abortController: AbortController | null = null;

  constructor() {
    super();
    this._shadow = this.attachShadow({mode: 'open'});
    const container = document.createElement('div');
    container.className = 'prompt-chart-container';
    this._shadow.innerHTML = `<style>${styles}</style>`;
    this._shadow.appendChild(container);

    this._stateRenderer = new StateRenderer(container);
    this._demoDataGenerator = new DemoDataGenerator();
    this._stateRenderer.renderEmptyState();
    setTimeout(() => {
      // if user has not set anything (to cause onRender to execute), force it
      if (!this._hasBeenRendered) this.onRender();
    }, 20); // rendering takes time, hence this is a high value to be safe
  }

  // prettier-ignore
  override onRender() {
    GoogleFont.attemptAppendStyleSheetToHead(this.style);
    WebComponentStyleUtils.applyDefaultStyleToComponent(this.style, this.containerStyle);
    this._hasBeenRendered = true;
  }

  connectedCallback(): void {
    if (this.data) {
      this._renderData();
    } else if (this.autoFetch && this.prompt && (this.connect?.url || this.demo)) {
      this.fetchChart();
    }
  }

  disconnectedCallback(): void {
    this._cleanup();
  }

  private _renderData(): void {
    if (!this.data) return;
    this._stateRenderer.renderChart(this.data);
    this.dispatchEvent(new CustomEvent('chart-loaded', {detail: this.data, bubbles: true, composed: true}));
    this.onChartLoaded?.(this.data);
  }

  /**
   * Fetch and render a chart based on the current prompt
   */
  async fetchChart(): Promise<void> {
    if (!this.prompt) {
      this._stateRenderer.showError('Missing prompt', () => this.fetchChart());
      return;
    }

    if (!this.demo && !this.connect?.url) {
      this._stateRenderer.showError('Missing connect.url', () => this.fetchChart());
      return;
    }

    if (this.demo) {
      await this._fetchDemoChart();
      return;
    }

    await this._fetchRemoteChart();
  }

  private async _fetchDemoChart(): Promise<void> {
    this._stateRenderer.showLoading();

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const data = this._demoDataGenerator.generate(this.prompt!);
    this._stateRenderer.renderChart(data);

    this.dispatchEvent(new CustomEvent('chart-loaded', {detail: data, bubbles: true, composed: true}));
    this.onChartLoaded?.(data);
  }

  private async _fetchRemoteChart(): Promise<void> {
    // Cancel any pending request
    this._abortController?.abort();
    this._abortController = new AbortController();

    this._stateRenderer.showLoading();

    try {
      // Build initial request details from connect config
      let requestDetails: RequestDetails = {
        endpoint: this.connect!.url!,
        method: this.connect!.method ?? 'POST',
        headers: {'Content-Type': 'application/json', ...this.connect!.headers},
        body: {prompt: this.prompt},
      };

      // Apply request interceptor if provided
      if (this.requestInterceptor) {
        requestDetails = await this.requestInterceptor(requestDetails);
      }

      const response = await fetch(requestDetails.endpoint, {
        method: requestDetails.method,
        headers: requestDetails.headers,
        body: JSON.stringify(requestDetails.body),
        signal: this._abortController.signal,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({error: 'Request failed'}));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const responseBody: unknown = await response.json();

      // Apply response interceptor if provided, otherwise use response directly
      const data: ChartResponseInput = this.responseInterceptor
        ? await this.responseInterceptor(responseBody)
        : (responseBody as ChartResponseInput);

      this._stateRenderer.renderChart(data);

      this.dispatchEvent(new CustomEvent('chart-loaded', {detail: data, bubbles: true, composed: true}));
      this.onChartLoaded?.(data);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled
      }

      const message = err instanceof Error ? err.message : 'Unknown error';
      this._stateRenderer.showError(message, () => this.fetchChart());

      this.dispatchEvent(new CustomEvent('chart-error', {detail: {error: message}, bubbles: true, composed: true}));
      this.onChartError?.();
    }
  }

  private _cleanup(): void {
    this._abortController?.abort();
    this._stateRenderer.destroy();
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

export {ChartRenderer, type ChartResponse, type ChartResponseInput};
