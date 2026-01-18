import {ChartResponseInput} from './response';

export interface RequestDetails {
  endpoint: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
}

export type RequestInterceptor = (request: RequestDetails) => RequestDetails | Promise<RequestDetails>;

export type ResponseInterceptor = (response: unknown) => ChartResponseInput | Promise<ChartResponseInput>;
