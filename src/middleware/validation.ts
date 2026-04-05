import { zValidator } from '@hono/zod-validator';
import type { ZodObject, ZodRawShape } from 'zod';

/**
 * Validate request JSON body against a Zod schema.
 */
export const validateBody = <T extends ZodRawShape>(schema: ZodObject<T>) =>
  zValidator('json', schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: result.error.issues.map((e) => ({ path: e.path.join('.'), message: e.message })),
        },
        400,
      );
    }
  });

/**
 * Validate request query parameters against a Zod schema.
 */
export const validateQuery = <T extends ZodRawShape>(schema: ZodObject<T>) =>
  zValidator('query', schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          error: 'Invalid query parameters',
          code: 'VALIDATION_ERROR',
          details: result.error.issues.map((e) => ({ path: e.path.join('.'), message: e.message })),
        },
        400,
      );
    }
  });

/**
 * Validate request path parameters against a Zod schema.
 */
export const validateParams = <T extends ZodRawShape>(schema: ZodObject<T>) =>
  zValidator('param', schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          error: 'Invalid path parameters',
          code: 'VALIDATION_ERROR',
          details: result.error.issues.map((e) => ({ path: e.path.join('.'), message: e.message })),
        },
        400,
      );
    }
  });
