import {type ChartResponseInput} from './types/response.js';
import {ChartRenderer} from './chartRenderer.js';

/**
 * Handles rendering of different UI states for the PromptChart component.
 * Manages loading, error, empty, and chart rendering states.
 */
export class StateRenderer {
  private readonly _container: HTMLDivElement;
  private _chartRenderers: ChartRenderer[] = [];

  constructor(container: HTMLDivElement) {
    this._container = container;
  }

  renderEmptyState(): void {
    this._container.innerHTML = `
      <div class="empty-state">
        <span>Set a prompt to generate a chart</span>
      </div>
    `;
  }

  showLoading(): void {
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

  showError(message: string, onRetry: () => void): void {
    this._container.innerHTML = `
      <div class="error-container">
        <div class="error-icon">!</div>
        <div class="error-message">${this._escapeHtml(message)}</div>
        <button class="retry-button">Retry</button>
      </div>
    `;

    const retryButton = this._container.querySelector('.retry-button');
    retryButton?.addEventListener('click', onRetry);
  }

  renderChart(response: ChartResponseInput): void {
    this._destroyRenderers();

    const charts = Array.isArray(response) ? response : [response];
    const isMultiple = charts.length > 1;

    if (isMultiple) {
      this._container.innerHTML = `<div class="charts-grid"></div>`;
      const grid = this._container.querySelector('.charts-grid')!;

      charts.forEach((chartResponse) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'chart-wrapper';
        wrapper.innerHTML = '<canvas></canvas>';
        grid.appendChild(wrapper);

        const canvas = wrapper.querySelector('canvas')!;
        const renderer = new ChartRenderer(canvas);
        renderer.render(chartResponse);
        this._chartRenderers.push(renderer);
      });
    } else {
      this._container.innerHTML = `
        <div class="chart-wrapper">
          <canvas></canvas>
        </div>
      `;

      const canvas = this._container.querySelector('canvas');
      if (!canvas) return;

      const renderer = new ChartRenderer(canvas);
      renderer.render(charts[0]);
      this._chartRenderers.push(renderer);
    }
  }

  destroy(): void {
    this._destroyRenderers();
  }

  private _destroyRenderers(): void {
    this._chartRenderers.forEach((renderer) => renderer.destroy());
    this._chartRenderers = [];
  }

  private _escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
