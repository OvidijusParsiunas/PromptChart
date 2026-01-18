import type {ChartResponse} from './types/response.js';

/**
 * Generates demo chart data based on natural language prompts.
 * Used for demonstration purposes without requiring a backend.
 */
export class DemoDataGenerator {
  generate(prompt: string): ChartResponse {
    const lowerPrompt = prompt.toLowerCase();

    const chartType = this.detectChartType(lowerPrompt);
    const title = prompt.charAt(0).toUpperCase() + prompt.slice(1);
    const {labels, datasets, dataset} = this.generateDataset(lowerPrompt);

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

  private detectChartType(lowerPrompt: string): string {
    if (lowerPrompt.includes('pie')) return 'pie';
    if (lowerPrompt.includes('doughnut') || lowerPrompt.includes('donut')) return 'doughnut';
    if (lowerPrompt.includes('line') || lowerPrompt.includes('trend')) return 'line';
    if (lowerPrompt.includes('area')) return 'area';
    if (lowerPrompt.includes('scatter')) return 'scatter';
    return 'bar';
  }

  private generateDataset(lowerPrompt: string): {
    labels: string[];
    datasets: ChartResponse['data']['datasets'];
    dataset: string;
  } {
    if (lowerPrompt.includes('month') || lowerPrompt.includes('year')) {
      return this.generateMonthlyData(lowerPrompt);
    }

    if (lowerPrompt.includes('product') || lowerPrompt.includes('revenue')) {
      return this.generateProductRevenueData();
    }

    if (lowerPrompt.includes('status') || lowerPrompt.includes('order')) {
      return this.generateOrderStatusData();
    }

    if (lowerPrompt.includes('signup') || lowerPrompt.includes('user')) {
      return this.generateUserSignupData();
    }

    if (lowerPrompt.includes('profit') || lowerPrompt.includes('top')) {
      return this.generateProfitData();
    }

    return this.generateDefaultData();
  }

  private generateMonthlyData(lowerPrompt: string): {
    labels: string[];
    datasets: ChartResponse['data']['datasets'];
    dataset: string;
  } {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if (lowerPrompt.includes('region')) {
      return {
        labels,
        datasets: [
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
        ],
        dataset: 'sales_by_region',
      };
    }

    return {
      labels,
      datasets: [
        {
          label: 'Value',
          data: [65, 78, 90, 81, 96, 105, 110, 102, 95, 88, 92, 108],
          backgroundColor: '#3b82f6',
          borderColor: '#3b82f6',
        },
      ],
      dataset: 'monthly_data',
    };
  }

  private generateProductRevenueData(): {
    labels: string[];
    datasets: ChartResponse['data']['datasets'];
    dataset: string;
  } {
    const labels = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return {
      labels,
      datasets: [
        {label: 'Revenue', data: [42000, 35000, 28000, 21000, 15000], backgroundColor: colors, borderColor: colors},
      ],
      dataset: 'product_revenue',
    };
  }

  private generateOrderStatusData(): {
    labels: string[];
    datasets: ChartResponse['data']['datasets'];
    dataset: string;
  } {
    const labels = ['Completed', 'Pending', 'Processing', 'Cancelled'];
    const colors = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

    return {
      labels,
      datasets: [{label: 'Orders', data: [245, 89, 56, 23], backgroundColor: colors, borderColor: colors}],
      dataset: 'order_status',
    };
  }

  private generateUserSignupData(): {
    labels: string[];
    datasets: ChartResponse['data']['datasets'];
    dataset: string;
  } {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return {
      labels,
      datasets: [
        {
          label: 'Signups',
          data: [120, 145, 180, 220, 290, 350, 420, 480, 520, 580, 650, 720],
          backgroundColor: '#8b5cf6',
          borderColor: '#8b5cf6',
        },
      ],
      dataset: 'user_signups',
    };
  }

  private generateProfitData(): {
    labels: string[];
    datasets: ChartResponse['data']['datasets'];
    dataset: string;
  } {
    const labels = ['Widget Pro', 'Gadget X', 'Tool Master', 'Device Plus', 'Smart Kit'];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return {
      labels,
      datasets: [{label: 'Profit', data: [18500, 15200, 12800, 9500, 7200], backgroundColor: colors, borderColor: colors}],
      dataset: 'product_profit',
    };
  }

  private generateDefaultData(): {
    labels: string[];
    datasets: ChartResponse['data']['datasets'];
    dataset: string;
  } {
    const labels = ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return {
      labels,
      datasets: [{label: 'Value', data: [42, 35, 28, 21, 15], backgroundColor: colors, borderColor: colors}],
      dataset: 'demo_data',
    };
  }
}
