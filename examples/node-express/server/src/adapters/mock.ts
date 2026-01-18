import type { DataAdapter, DataRecord } from './base.js';
import type { ChartIntent, ChartData, Dataset, Filter } from '../types/index.js';

// Color palettes for charts
const COLORS = {
  primary: [
    'rgba(59, 130, 246, 0.8)',   // blue
    'rgba(16, 185, 129, 0.8)',   // green
    'rgba(245, 158, 11, 0.8)',   // amber
    'rgba(239, 68, 68, 0.8)',    // red
    'rgba(139, 92, 246, 0.8)',   // purple
    'rgba(236, 72, 153, 0.8)',   // pink
    'rgba(20, 184, 166, 0.8)',   // teal
    'rgba(249, 115, 22, 0.8)',   // orange
  ],
  border: [
    'rgba(59, 130, 246, 1)',
    'rgba(16, 185, 129, 1)',
    'rgba(245, 158, 11, 1)',
    'rgba(239, 68, 68, 1)',
    'rgba(139, 92, 246, 1)',
    'rgba(236, 72, 153, 1)',
    'rgba(20, 184, 166, 1)',
    'rgba(249, 115, 22, 1)',
  ],
};

// Mock data for different datasets
const MOCK_DATA: Record<Dataset, DataRecord[]> = {
  sales: [
    { month: 'Jan', quarter: 'Q1', year: 2024, region: 'North', category: 'Electronics', amount: 45000, quantity: 120, revenue: 45000 },
    { month: 'Jan', quarter: 'Q1', year: 2024, region: 'South', category: 'Electronics', amount: 38000, quantity: 95, revenue: 38000 },
    { month: 'Jan', quarter: 'Q1', year: 2024, region: 'North', category: 'Clothing', amount: 22000, quantity: 310, revenue: 22000 },
    { month: 'Feb', quarter: 'Q1', year: 2024, region: 'North', category: 'Electronics', amount: 52000, quantity: 140, revenue: 52000 },
    { month: 'Feb', quarter: 'Q1', year: 2024, region: 'South', category: 'Electronics', amount: 41000, quantity: 105, revenue: 41000 },
    { month: 'Feb', quarter: 'Q1', year: 2024, region: 'North', category: 'Clothing', amount: 25000, quantity: 340, revenue: 25000 },
    { month: 'Mar', quarter: 'Q1', year: 2024, region: 'North', category: 'Electronics', amount: 48000, quantity: 130, revenue: 48000 },
    { month: 'Mar', quarter: 'Q1', year: 2024, region: 'South', category: 'Electronics', amount: 44000, quantity: 115, revenue: 44000 },
    { month: 'Mar', quarter: 'Q1', year: 2024, region: 'North', category: 'Clothing', amount: 28000, quantity: 380, revenue: 28000 },
    { month: 'Apr', quarter: 'Q2', year: 2024, region: 'North', category: 'Electronics', amount: 55000, quantity: 145, revenue: 55000 },
    { month: 'Apr', quarter: 'Q2', year: 2024, region: 'South', category: 'Electronics', amount: 47000, quantity: 120, revenue: 47000 },
    { month: 'May', quarter: 'Q2', year: 2024, region: 'North', category: 'Electronics', amount: 61000, quantity: 160, revenue: 61000 },
    { month: 'May', quarter: 'Q2', year: 2024, region: 'South', category: 'Electronics', amount: 52000, quantity: 135, revenue: 52000 },
    { month: 'Jun', quarter: 'Q2', year: 2024, region: 'North', category: 'Electronics', amount: 58000, quantity: 155, revenue: 58000 },
    { month: 'Jun', quarter: 'Q2', year: 2024, region: 'South', category: 'Electronics', amount: 49000, quantity: 125, revenue: 49000 },
  ],
  users: [
    { month: 'Jan', year: 2024, channel: 'Organic', signups: 1200, activeUsers: 8500, sessions: 45000 },
    { month: 'Jan', year: 2024, channel: 'Paid', signups: 800, activeUsers: 3200, sessions: 18000 },
    { month: 'Feb', year: 2024, channel: 'Organic', signups: 1350, activeUsers: 9200, sessions: 51000 },
    { month: 'Feb', year: 2024, channel: 'Paid', signups: 950, activeUsers: 3800, sessions: 21000 },
    { month: 'Mar', year: 2024, channel: 'Organic', signups: 1500, activeUsers: 10100, sessions: 58000 },
    { month: 'Mar', year: 2024, channel: 'Paid', signups: 1100, activeUsers: 4500, sessions: 25000 },
    { month: 'Apr', year: 2024, channel: 'Organic', signups: 1650, activeUsers: 11200, sessions: 64000 },
    { month: 'Apr', year: 2024, channel: 'Paid', signups: 1250, activeUsers: 5200, sessions: 29000 },
    { month: 'May', year: 2024, channel: 'Organic', signups: 1800, activeUsers: 12500, sessions: 72000 },
    { month: 'May', year: 2024, channel: 'Paid', signups: 1400, activeUsers: 6000, sessions: 34000 },
    { month: 'Jun', year: 2024, channel: 'Organic', signups: 1950, activeUsers: 13800, sessions: 79000 },
    { month: 'Jun', year: 2024, channel: 'Paid', signups: 1550, activeUsers: 6800, sessions: 38000 },
  ],
  products: [
    { product: 'Laptop Pro', category: 'Electronics', price: 1299, quantity: 450, revenue: 584550, cost: 400000, profit: 184550 },
    { product: 'Wireless Mouse', category: 'Electronics', price: 49, quantity: 2200, revenue: 107800, cost: 44000, profit: 63800 },
    { product: 'USB-C Hub', category: 'Electronics', price: 79, quantity: 1800, revenue: 142200, cost: 54000, profit: 88200 },
    { product: 'Mechanical Keyboard', category: 'Electronics', price: 159, quantity: 950, revenue: 151050, cost: 66500, profit: 84550 },
    { product: 'Monitor 27"', category: 'Electronics', price: 449, quantity: 620, revenue: 278380, cost: 186000, profit: 92380 },
    { product: 'Webcam HD', category: 'Electronics', price: 89, quantity: 1400, revenue: 124600, cost: 56000, profit: 68600 },
    { product: 'Headphones', category: 'Electronics', price: 199, quantity: 1100, revenue: 218900, cost: 88000, profit: 130900 },
    { product: 'Tablet Stand', category: 'Accessories', price: 39, quantity: 3200, revenue: 124800, cost: 48000, profit: 76800 },
  ],
  orders: [
    { month: 'Jan', status: 'completed', region: 'North', count: 1250, amount: 125000 },
    { month: 'Jan', status: 'pending', region: 'North', count: 85, amount: 8500 },
    { month: 'Jan', status: 'cancelled', region: 'North', count: 45, amount: 4500 },
    { month: 'Feb', status: 'completed', region: 'North', count: 1380, amount: 138000 },
    { month: 'Feb', status: 'pending', region: 'North', count: 92, amount: 9200 },
    { month: 'Mar', status: 'completed', region: 'North', count: 1520, amount: 152000 },
    { month: 'Mar', status: 'pending', region: 'North', count: 78, amount: 7800 },
    { month: 'Apr', status: 'completed', region: 'North', count: 1650, amount: 165000 },
    { month: 'May', status: 'completed', region: 'North', count: 1780, amount: 178000 },
    { month: 'Jun', status: 'completed', region: 'North', count: 1890, amount: 189000 },
  ],
  inventory: [
    { product: 'Laptop Pro', category: 'Electronics', quantity: 125, status: 'in_stock' },
    { product: 'Wireless Mouse', category: 'Electronics', quantity: 580, status: 'in_stock' },
    { product: 'USB-C Hub', category: 'Electronics', quantity: 45, status: 'low_stock' },
    { product: 'Mechanical Keyboard', category: 'Electronics', quantity: 210, status: 'in_stock' },
    { product: 'Monitor 27"', category: 'Electronics', quantity: 18, status: 'low_stock' },
    { product: 'Webcam HD', category: 'Electronics', quantity: 340, status: 'in_stock' },
    { product: 'Headphones', category: 'Electronics', quantity: 0, status: 'out_of_stock' },
    { product: 'Tablet Stand', category: 'Accessories', quantity: 890, status: 'in_stock' },
  ],
};

// Dataset metadata
const DATASET_METADATA: Record<Dataset, { metrics: string[]; dimensions: string[] }> = {
  sales: {
    metrics: ['amount', 'quantity', 'revenue'],
    dimensions: ['month', 'quarter', 'year', 'region', 'category'],
  },
  users: {
    metrics: ['signups', 'activeUsers', 'sessions'],
    dimensions: ['month', 'year', 'channel'],
  },
  products: {
    metrics: ['price', 'quantity', 'revenue', 'cost', 'profit'],
    dimensions: ['product', 'category'],
  },
  orders: {
    metrics: ['count', 'amount'],
    dimensions: ['month', 'status', 'region'],
  },
  inventory: {
    metrics: ['quantity'],
    dimensions: ['product', 'category', 'status'],
  },
};

export class MockDataAdapter implements DataAdapter {
  getAvailableDatasets(): Dataset[] {
    return Object.keys(MOCK_DATA) as Dataset[];
  }

  getAvailableMetrics(dataset: Dataset): string[] {
    return DATASET_METADATA[dataset]?.metrics ?? [];
  }

  getAvailableDimensions(dataset: Dataset): string[] {
    return DATASET_METADATA[dataset]?.dimensions ?? [];
  }

  async executeQuery(intent: ChartIntent): Promise<ChartData> {
    const data = MOCK_DATA[intent.dataset];
    if (!data) {
      throw new Error(`Unknown dataset: ${intent.dataset}`);
    }

    // Apply filters
    let filtered = this.applyFilters(data, intent.filters);

    // Group by dimensions and aggregate
    const grouped = this.groupAndAggregate(filtered, intent);

    // Sort if specified
    if (intent.sortBy) {
      this.sortResults(grouped, intent.sortBy, intent.sortOrder ?? 'desc');
    }

    // Apply limit
    if (intent.limit) {
      grouped.labels = grouped.labels.slice(0, intent.limit);
      grouped.datasets.forEach(ds => {
        ds.data = ds.data.slice(0, intent.limit);
      });
    }

    return grouped;
  }

  private applyFilters(data: DataRecord[], filters?: Filter[]): DataRecord[] {
    if (!filters || filters.length === 0) return data;

    return data.filter(record => {
      return filters.every(filter => {
        const value = record[filter.field];
        const filterValue = filter.value;

        switch (filter.operator) {
          case 'eq':
            return value === filterValue;
          case 'neq':
            return value !== filterValue;
          case 'gt':
            return typeof value === 'number' && typeof filterValue === 'number' && value > filterValue;
          case 'gte':
            return typeof value === 'number' && typeof filterValue === 'number' && value >= filterValue;
          case 'lt':
            return typeof value === 'number' && typeof filterValue === 'number' && value < filterValue;
          case 'lte':
            return typeof value === 'number' && typeof filterValue === 'number' && value <= filterValue;
          case 'in':
            return Array.isArray(filterValue) && filterValue.includes(value as string | number);
          case 'between':
            if (Array.isArray(filterValue) && filterValue.length === 2 && typeof value === 'number') {
              return value >= (filterValue[0] as number) && value <= (filterValue[1] as number);
            }
            return false;
          default:
            return true;
        }
      });
    });
  }

  private groupAndAggregate(data: DataRecord[], intent: ChartIntent): ChartData {
    const dimension = intent.dimensions?.[0];
    const metrics = intent.metrics;

    // If no dimension, aggregate all data
    if (!dimension) {
      const labels = metrics.map(m => m.label ?? `${m.aggregation}(${m.field})`);
      const values = metrics.map(m => this.aggregate(data, m.field, m.aggregation));

      return {
        labels,
        datasets: [{
          label: 'Value',
          data: values,
          backgroundColor: COLORS.primary.slice(0, values.length),
          borderColor: COLORS.border.slice(0, values.length),
          borderWidth: 1,
        }],
      };
    }

    // Group by dimension
    const groups = new Map<string, DataRecord[]>();
    for (const record of data) {
      const key = String(record[dimension.field] ?? 'Unknown');
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(record);
    }

    const labels = Array.from(groups.keys());
    const datasets = metrics.map((metric, idx) => ({
      label: metric.label ?? `${metric.aggregation}(${metric.field})`,
      data: labels.map(label => this.aggregate(groups.get(label)!, metric.field, metric.aggregation)),
      backgroundColor: intent.chartType === 'pie' || intent.chartType === 'doughnut'
        ? COLORS.primary.slice(0, labels.length)
        : COLORS.primary[idx % COLORS.primary.length],
      borderColor: intent.chartType === 'pie' || intent.chartType === 'doughnut'
        ? COLORS.border.slice(0, labels.length)
        : COLORS.border[idx % COLORS.border.length],
      borderWidth: 1,
    }));

    return { labels, datasets };
  }

  private aggregate(records: DataRecord[], field: string, aggregation: string): number {
    const values = records
      .map(r => r[field])
      .filter((v): v is number => typeof v === 'number');

    if (values.length === 0) return 0;

    switch (aggregation) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'avg':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      case 'count':
        return values.length;
      default:
        return values.reduce((a, b) => a + b, 0);
    }
  }

  private sortResults(data: ChartData, sortBy: string, sortOrder: string): void {
    const indices = data.labels.map((_, i) => i);

    indices.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'label') {
        comparison = data.labels[a].localeCompare(data.labels[b]);
      } else if (sortBy === 'value' && data.datasets[0]) {
        comparison = data.datasets[0].data[a] - data.datasets[0].data[b];
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    data.labels = indices.map(i => data.labels[i]);
    data.datasets.forEach(ds => {
      ds.data = indices.map(i => ds.data[i]);
      if (Array.isArray(ds.backgroundColor)) {
        ds.backgroundColor = indices.map(i => (ds.backgroundColor as string[])[i]);
      }
      if (Array.isArray(ds.borderColor)) {
        ds.borderColor = indices.map(i => (ds.borderColor as string[])[i]);
      }
    });
  }
}
