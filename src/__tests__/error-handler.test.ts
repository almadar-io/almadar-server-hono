import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import { z } from 'zod';

vi.mock('@almadar/server', async () => {
  class AppError extends Error {
    statusCode: number;
    code: string | undefined;
    constructor(statusCode: number, message: string, code?: string) {
      super(message);
      this.name = 'AppError';
      this.statusCode = statusCode;
      this.code = code;
    }
  }
  return {
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    AppError,
  };
});

// Import after mock so the middleware gets the mocked AppError
import { errorHandler, notFoundHandler } from '../middleware/error-handler.js';
// Import mocked AppError for use in tests
import { AppError } from '@almadar/server';

interface ErrorResponse {
  success: boolean;
  error: string;
  code: string;
  details?: Array<{ path: string; message: string }>;
}

function createApp() {
  const app = new Hono();
  app.onError(errorHandler);
  app.notFound(notFoundHandler);
  return app;
}

describe('errorHandler', () => {
  it('handles ZodError with 400 and validation details', async () => {
    const app = createApp();
    app.get('/zod', () => {
      const schema = z.object({ name: z.string() });
      schema.parse({ name: 123 });
      return new Response('unreachable');
    });

    const res = await app.request('/zod');
    expect(res.status).toBe(400);

    const body = (await res.json()) as ErrorResponse;
    expect(body.success).toBe(false);
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.details).toBeDefined();
    expect(body.details!.length).toBeGreaterThan(0);
  });

  it('handles AppError with correct status code and code', async () => {
    const app = createApp();
    app.get('/app-error', () => {
      throw new AppError(403, 'Access denied', 'FORBIDDEN');
    });

    const res = await app.request('/app-error');
    expect(res.status).toBe(403);

    const body = (await res.json()) as ErrorResponse;
    expect(body.success).toBe(false);
    expect(body.error).toBe('Access denied');
    expect(body.code).toBe('FORBIDDEN');
  });

  it('handles generic errors with 500', async () => {
    const app = createApp();
    app.get('/fail', () => {
      throw new Error('something broke');
    });

    const res = await app.request('/fail');
    expect(res.status).toBe(500);

    const body = (await res.json()) as ErrorResponse;
    expect(body.success).toBe(false);
    expect(body.code).toBe('INTERNAL_ERROR');
  });

  it('handles Firebase errors with DATABASE_ERROR', async () => {
    const app = createApp();
    app.get('/firebase', () => {
      const err = new Error('connection failed');
      err.name = 'FirebaseError';
      throw err;
    });

    const res = await app.request('/firebase');
    expect(res.status).toBe(500);

    const body = (await res.json()) as ErrorResponse;
    expect(body.code).toBe('DATABASE_ERROR');
  });

  it('handles Firestore errors with DATABASE_ERROR', async () => {
    const app = createApp();
    app.get('/firestore', () => {
      const err = new Error('query failed');
      err.name = 'FirestoreError';
      throw err;
    });

    const res = await app.request('/firestore');
    expect(res.status).toBe(500);

    const body = (await res.json()) as ErrorResponse;
    expect(body.code).toBe('DATABASE_ERROR');
  });
});

describe('notFoundHandler', () => {
  it('returns 404 with route info', async () => {
    const app = createApp();

    const res = await app.request('/does-not-exist');
    expect(res.status).toBe(404);

    const body = (await res.json()) as ErrorResponse;
    expect(body.success).toBe(false);
    expect(body.code).toBe('ROUTE_NOT_FOUND');
    expect(body.error).toContain('GET');
    expect(body.error).toContain('/does-not-exist');
  });
});
