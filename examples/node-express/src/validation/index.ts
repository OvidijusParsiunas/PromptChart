import Ajv from 'ajv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { ChartIntent } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load schema from local schemas directory
const schemaPath = join(__dirname, '../../schemas/intent.schema.json');
let intentSchema: object;

try {
  intentSchema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
} catch {
  // Fallback inline schema for development/testing
  intentSchema = {
    type: 'object',
    required: ['dataset', 'metrics', 'chartType'],
    properties: {
      dataset: { type: 'string' },
      metrics: { type: 'array', minItems: 1 },
      dimensions: { type: 'array' },
      filters: { type: 'array' },
      chartType: { type: 'string' },
      title: { type: 'string' },
      sortBy: { type: 'string' },
      sortOrder: { type: 'string' },
      limit: { type: 'integer', minimum: 1, maximum: 100 },
    },
  };
}

const ajv = new Ajv({ allErrors: true, strict: false });
const validateIntent = ajv.compile<ChartIntent>(intentSchema);

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Validate a chart intent against the JSON schema
 */
export function validateChartIntent(intent: unknown): ValidationResult {
  const valid = validateIntent(intent);

  if (!valid) {
    const errors = validateIntent.errors?.map(err => {
      const path = err.instancePath || 'root';
      return `${path}: ${err.message}`;
    });
    return { valid: false, errors };
  }

  return { valid: true };
}

/**
 * Validate and sanitize user prompt
 */
export function sanitizePrompt(prompt: string): string {
  // Remove potential injection attempts
  let sanitized = prompt
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[{}]/g, '')     // Remove braces that could affect JSON
    .trim();

  // Limit length
  if (sanitized.length > 1000) {
    sanitized = sanitized.slice(0, 1000);
  }

  return sanitized;
}
