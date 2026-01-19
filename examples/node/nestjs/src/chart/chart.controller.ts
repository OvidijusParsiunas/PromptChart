import { Controller, Post, Body, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ChartService } from './chart.service';
import type { ChartRequest, ChartResponse, ErrorResponse } from '../types';

@Controller('api/chart')
export class ChartController {
  constructor(private readonly chartService: ChartService) {}

  @Post()
  async generateChart(@Body() body: ChartRequest): Promise<ChartResponse> {
    const { prompt, context } = body;

    if (!prompt || typeof prompt !== 'string') {
      const error: ErrorResponse = {
        error: 'Missing or invalid prompt',
        code: 'INVALID_REQUEST',
      };
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.chartService.resolve(prompt, context);
    } catch (err) {
      console.error('Chart generation error:', err);

      const isInvalidIntent = err instanceof Error && err.message.includes('Invalid intent');
      const error: ErrorResponse = {
        error: err instanceof Error ? err.message : 'Internal server error',
        code: isInvalidIntent ? 'INVALID_INTENT' : 'INTERNAL_ERROR',
      };

      throw new HttpException(error, isInvalidIntent ? HttpStatus.BAD_REQUEST : HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
