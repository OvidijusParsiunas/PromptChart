export interface ChartSpec {
  type: string;
  title: string;
  xAxis?: {
    label?: string;
    type?: string;
  };
  yAxis?: {
    label?: string;
    type?: string;
  };
  legend?: {
    position?: 'top' | 'bottom' | 'left' | 'right';
    display?: boolean;
  };
}
