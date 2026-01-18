import { Router, type Request, type Response } from 'express';
import type { IntentResolver } from '../services/intent-resolver.js';
import type { ChartRequest, ErrorResponse } from '../types/index.js';

export function createChartRouter(resolver: IntentResolver): Router {
  const router = Router();

  /**
   * POST /api/chart
   * Generate a chart from a natural language prompt
   */
  router.post('/', async (req: Request, res: Response) => {
    try {
      const { prompt, context } = req.body as ChartRequest;

      if (!prompt || typeof prompt !== 'string') {
        const error: ErrorResponse = {
          error: 'Missing or invalid prompt',
          code: 'INVALID_REQUEST',
        };
        res.status(400).json(error);
        return;
      }

      const result = await resolver.resolve(prompt, context);
      res.json(result);
    } catch (err) {
      console.error('Chart generation error:', err);

      const error: ErrorResponse = {
        error: err instanceof Error ? err.message : 'Internal server error',
        code: err instanceof Error && err.message.includes('Invalid intent')
          ? 'INVALID_INTENT'
          : 'INTERNAL_ERROR',
      };

      const status = error.code === 'INVALID_INTENT' ? 400 : 500;
      res.status(status).json(error);
    }
  });

  /**
   * GET /api/chart/datasets
   * List available datasets
   */
  router.get('/datasets', (_req: Request, res: Response) => {
    // This would come from the adapter, but for simplicity we hardcode it
    res.json({
      datasets: ['sales', 'users', 'products', 'orders', 'inventory'],
    });
  });

  return router;
}
