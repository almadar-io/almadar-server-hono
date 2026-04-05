import type { ErrorHandler, NotFoundHandler } from 'hono';
import { ZodError } from 'zod';
import { logger, AppError } from '@almadar/server';

/**
 * Global error handler for Hono applications.
 * Ports the Express errorHandler from @almadar/server.
 */
export const errorHandler: ErrorHandler = (err, c) => {
  logger.error('Error:', { name: err.name, message: err.message, stack: err.stack });

  // Zod validation errors
  if (err instanceof ZodError) {
    return c.json(
      {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
      },
      400,
    );
  }

  // Custom application errors
  if (err instanceof AppError) {
    return c.json(
      { success: false, error: err.message, code: err.code },
      err.statusCode as 400 | 401 | 403 | 404 | 409 | 500,
    );
  }

  // Firebase/Firestore errors
  if (err.name === 'FirebaseError' || err.name === 'FirestoreError') {
    return c.json({ success: false, error: 'Database error', code: 'DATABASE_ERROR' }, 500);
  }

  // Unknown errors
  return c.json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' }, 500);
};

/**
 * 404 handler for unmatched routes.
 */
export const notFoundHandler: NotFoundHandler = (c) => {
  return c.json(
    {
      success: false,
      error: `Route ${c.req.method} ${c.req.path} not found`,
      code: 'ROUTE_NOT_FOUND',
    },
    404,
  );
};
