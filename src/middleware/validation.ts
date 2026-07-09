import { zValidator } from '@hono/zod-validator';
import type { MiddlewareHandler } from 'hono';
import type { ZodObject, ZodRawShape, TypeOf } from 'zod';

type ValidatedInput<Target extends 'json' | 'query' | 'param', Shape extends ZodRawShape> = {
  in: { [K in Target]: TypeOf<ZodObject<Shape>> };
  out: { [K in Target]: TypeOf<ZodObject<Shape>> };
};

/**
 * Validate request JSON body against a Zod schema.
 */
export const validateBody = <T extends ZodRawShape>(
  schema: ZodObject<T>,
): MiddlewareHandler<any, any, ValidatedInput<'json', T>> =>
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
  }) as MiddlewareHandler<any, any, ValidatedInput<'json', T>>;

/**
 * Validate request query parameters against a Zod schema.
 */
export const validateQuery = <T extends ZodRawShape>(
  schema: ZodObject<T>,
): MiddlewareHandler<any, any, ValidatedInput<'query', T>> =>
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
  }) as MiddlewareHandler<any, any, ValidatedInput<'query', T>>;

/**
 * Validate request path parameters against a Zod schema.
 */
export const validateParams = <T extends ZodRawShape>(
  schema: ZodObject<T>,
): MiddlewareHandler<any, any, ValidatedInput<'param', T>> =>
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
  }) as MiddlewareHandler<any, any, ValidatedInput<'param', T>>;
