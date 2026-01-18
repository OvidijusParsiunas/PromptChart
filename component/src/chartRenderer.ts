import {ChartResponse} from './types/response';
import {ChartSpec} from './types/chart';
import {
  type ChartConfiguration,
  DoughnutController,
  ScatterController,
  LineController,
  type ChartType,
  CategoryScale,
  BarController,
  PieController,
  PointElement,
  LinearScale,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Filler,
  Legend,
  Chart,
  Title,
} from 'chart.js';

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  PieController,
  DoughnutController,
  ArcElement,
  ScatterController,
  Filler,
  Legend,
  Title,
  Tooltip
);

export class ChartRenderer {
  private chart: Chart | null = null;
  private readonly canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  render(response: ChartResponse): void {
    // Destroy existing chart
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    const {chartSpec, data} = response;
    const chartType = this.mapChartType(chartSpec.type);

    const config = {
      type: chartType,
      data: {
        labels: data.labels,
        datasets: data.datasets.map((ds) => ({
          ...ds,
          fill: chartSpec.type === 'area',
          tension: chartSpec.type === 'line' || chartSpec.type === 'area' ? 0.3 : 0,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: !!chartSpec.title,
            text: chartSpec.title,
            font: {
              size: 16,
              weight: 'bold',
            },
          },
          legend: {
            display: chartSpec.legend?.display ?? true,
            position: chartSpec.legend?.position ?? 'top',
          },
          tooltip: {
            enabled: true,
          },
        },
        scales: this.buildScales(chartSpec, chartType),
      },
    } as ChartConfiguration;

    this.chart = new Chart(this.canvas, config);
  }

  private mapChartType(type: string): ChartType {
    switch (type) {
      case 'area':
        return 'line';
      case 'bar':
      case 'line':
      case 'pie':
      case 'doughnut':
      case 'scatter':
        return type;
      default:
        return 'bar';
    }
  }

  private buildScales(spec: ChartSpec, chartType: ChartType): Record<string, unknown> | undefined {
    // Pie and doughnut charts don't have scales
    if (chartType === 'pie' || chartType === 'doughnut') {
      return undefined;
    }

    return {
      x: {
        display: true,
        title: {
          display: !!spec.xAxis?.label,
          text: spec.xAxis?.label,
        },
      },
      y: {
        display: true,
        title: {
          display: !!spec.yAxis?.label,
          text: spec.yAxis?.label,
        },
        beginAtZero: true,
      },
    };
  }

  destroy(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}
