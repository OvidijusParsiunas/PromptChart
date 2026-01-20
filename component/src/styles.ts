export const styles = `
  :host {
    display: block;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  }

  .prompt-chart-container {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 300px;
    background-color: inherit;
  }

  .chart-wrapper {
    width: 100%;
    height: 100%;
    min-height: 300px;
  }

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
    width: 100%;
    height: 100%;
  }

  .charts-grid .chart-wrapper {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    background: #fff;
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: inherit;
    z-index: 10;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-text {
    margin-top: 12px;
    color: #6b7280;
    font-size: 14px;
  }

  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 200px;
    padding: 20px;
    text-align: center;
    color: #dc2626;
  }

  .error-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .error-message {
    font-size: 14px;
    max-width: 400px;
  }

  .retry-button {
    margin-top: 16px;
    padding: 8px 16px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
  }

  .retry-button:hover {
    background: #2563eb;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 200px;
    color: #9ca3af;
    font-size: 14px;
  }
`;
