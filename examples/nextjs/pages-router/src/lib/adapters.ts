import type { ChartIntent, ChartData, ChartDataset, Dataset, Filter } from './types';

const COLORS = {
  primary: [
    'rgba(59, 130, 246, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(245, 158, 11, 0.8)',
    'rgba(239, 68, 68, 0.8)',
    'rgba(139, 92, 246, 0.8)',
    'rgba(236, 72, 153, 0.8)',
  ],
  border: [
    'rgba(59, 130, 246, 1)',
    'rgba(16, 185, 129, 1)',
    'rgba(245, 158, 11, 1)',
    'rgba(239, 68, 68, 1)',
    'rgba(139, 92, 246, 1)',
    'rgba(236, 72, 153, 1)',
  ],
};

type DataRecord = Record<string, string | number>;

const MOCK_DATA: Record<Dataset, DataRecord[]> = {
  sales: [
    { month: 'Jan', region: 'North', amount: 45000, quantity: 120, revenue: 45000 },
    { month: 'Jan', region: 'South', amount: 38000, quantity: 95, revenue: 38000 },
    { month: 'Feb', region: 'North', amount: 52000, quantity: 140, revenue: 52000 },
    { month: 'Feb', region: 'South', amount: 41000, quantity: 105, revenue: 41000 },
    { month: 'Mar', region: 'North', amount: 48000, quantity: 130, revenue: 48000 },
    { month: 'Mar', region: 'South', amount: 44000, quantity: 115, revenue: 44000 },
  ],
  users: [
    { month: 'Jan', channel: 'Organic', signups: 1200, activeUsers: 8500, sessions: 45000 },
    { month: 'Jan', channel: 'Paid', signups: 800, activeUsers: 3200, sessions: 18000 },
    { month: 'Feb', channel: 'Organic', signups: 1350, activeUsers: 9200, sessions: 51000 },
    { month: 'Feb', channel: 'Paid', signups: 950, activeUsers: 3800, sessions: 21000 },
  ],
  products: [
    { product: 'Laptop Pro', category: 'Electronics', price: 1299, quantity: 450, revenue: 584550, profit: 184550 },
    { product: 'Wireless Mouse', category: 'Electronics', price: 49, quantity: 2200, revenue: 107800, profit: 63800 },
    { product: 'USB-C Hub', category: 'Electronics', price: 79, quantity: 1800, revenue: 142200, profit: 88200 },
    { product: 'Headphones', category: 'Electronics', price: 199, quantity: 1100, revenue: 218900, profit: 130900 },
  ],
  orders: [
    { month: 'Jan', status: 'completed', region: 'North', count: 1250, amount: 125000 },
    { month: 'Jan', status: 'pending', region: 'North', count: 85, amount: 8500 },
    { month: 'Feb', status: 'completed', region: 'North', count: 1380, amount: 138000 },
    { month: 'Mar', status: 'completed', region: 'North', count: 1520, amount: 152000 },
  ],
  inventory: [
    { product: 'Laptop Pro', category: 'Electronics', quantity: 125, status: 'in_stock' },
    { product: 'Wireless Mouse', category: 'Electronics', quantity: 580, status: 'in_stock' },
    { product: 'USB-C Hub', category: 'Electronics', quantity: 45, status: 'low_stock' },
    { product: 'Headphones', category: 'Electronics', quantity: 0, status: 'out_of_stock' },
  ],
};

const DATASET_METADATA: Record<Dataset, { metrics: string[]; dimensions: string[] }> = {
  sales: { metrics: ['amount', 'quantity', 'revenue'], dimensions: ['month', 'region', 'category'] },
  users: { metrics: ['signups', 'activeUsers', 'sessions'], dimensions: ['month', 'channel'] },
  products: { metrics: ['price', 'quantity', 'revenue', 'profit'], dimensions: ['product', 'category'] },
  orders: { metrics: ['count', 'amount'], dimensions: ['month', 'status', 'region'] },
  inventory: { metrics: ['quantity'], dimensions: ['product', 'category', 'status'] },
};

export interface DataAdapter {
  getAvailableDatasets(): Dataset[];
  getAvailableMetrics(dataset: Dataset): string[];
  getAvailableDimensions(dataset: Dataset): string[];
  executeQuery(intent: ChartIntent): ChartData;
}

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

  executeQuery(intent: ChartIntent): ChartData {
    const data = MOCK_DATA[intent.dataset];
    if (!data) throw new Error(`Unknown dataset: ${intent.dataset}`);

    const filtered = this.applyFilters(data, intent.filters);
    return this.groupAndAggregate(filtered, intent);
  }

  private applyFilters(data: DataRecord[], filters?: Filter[]): DataRecord[] {
    if (!filters?.length) return data;
    return data.filter((record) => filters.every((f) => this.checkFilter(record, f)));
  }

  private checkFilter(record: DataRecord, f: Filter): boolean {
    const value = record[f.field];
    switch (f.operator) {
      case 'eq':
        return value === f.value;
      case 'neq':
        return value !== f.value;
      default:
        return true;
    }
  }

  private groupAndAggregate(data: DataRecord[], intent: ChartIntent): ChartData {
    const dimension = intent.dimensions?.[0];
    const metrics = intent.metrics;

    if (!dimension) {
      const labels = metrics.map((m) => m.label ?? `${m.aggregation}(${m.field})`);
      const values = metrics.map((m) => this.aggregate(data, m.field, m.aggregation));
      return {
        labels,
        datasets: [
          {
            label: 'Value',
            data: values,
            backgroundColor: COLORS.primary.slice(0, values.length),
            borderColor: COLORS.border.slice(0, values.length),
            borderWidth: 1,
          },
        ],
      };
    }

    const groups = new Map<string, DataRecord[]>();
    for (const record of data) {
      const key = String(record[dimension.field] ?? 'Unknown');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(record);
    }

    const labels = Array.from(groups.keys());
    const isPie = intent.chartType === 'pie' || intent.chartType === 'doughnut';

    const datasets: ChartDataset[] = metrics.map((metric, idx) => ({
      label: metric.label ?? `${metric.aggregation}(${metric.field})`,
      data: labels.map((label) => this.aggregate(groups.get(label)!, metric.field, metric.aggregation)),
      backgroundColor: isPie ? COLORS.primary.slice(0, labels.length) : COLORS.primary[idx % COLORS.primary.length],
      borderColor: isPie ? COLORS.border.slice(0, labels.length) : COLORS.border[idx % COLORS.border.length],
      borderWidth: 1,
    }));

    return { labels, datasets };
  }

  private aggregate(records: DataRecord[], field: string, aggregation: string): number {
    const values = records.map((r) => r[field]).filter((v): v is number => typeof v === 'number');
    if (!values.length) return 0;

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
}
