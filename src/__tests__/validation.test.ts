import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { z } from 'zod';
import { validateBody, validateQuery, validateParams } from '../middleware/validation.js';

interface ErrorResponse {
  success: boolean;
  error: string;
  code: string;
  details?: Array<{ path: string; message: string }>;
}

describe('validateBody', () => {
  it('passes valid body through', async () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    const app = new Hono();
    app.post('/test', validateBody(schema), (c) => {
      const data = c.req.valid('json');
      return c.json({ received: data });
    });

    const res = await app.request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', age: 30 }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { received: { name: string; age: number } };
    expect(body.received.name).toBe('Alice');
    expect(body.received.age).toBe(30);
  });

  it('rejects invalid body with 400', async () => {
    const schema = z.object({ name: z.string() });
    const app = new Hono();
    app.post('/test', validateBody(schema), (c) => {
      return c.json({ ok: true });
    });

    const res = await app.request('/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 123 }),
    });

    expect(res.status).toBe(400);
    const body = (await res.json()) as ErrorResponse;
    expect(body.success).toBe(false);
    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.details).toBeDefined();
  });
});

describe('validateQuery', () => {
  it('passes valid query through', async () => {
    const schema = z.object({ page: z.string() });
    const app = new Hono();
    app.get('/test', validateQuery(schema), (c) => {
      const data = c.req.valid('query');
      return c.json({ page: data.page });
    });

    const res = await app.request('/test?page=1');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { page: string };
    expect(body.page).toBe('1');
  });

  it('rejects invalid query with 400', async () => {
    const schema = z.object({ page: z.string().min(1) });
    const app = new Hono();
    app.get('/test', validateQuery(schema), (c) => {
      return c.json({ ok: true });
    });

    const res = await app.request('/test');
    expect(res.status).toBe(400);
    const body = (await res.json()) as ErrorResponse;
    expect(body.code).toBe('VALIDATION_ERROR');
  });
});

describe('validateParams', () => {
  it('passes valid params through', async () => {
    const schema = z.object({ id: z.string() });
    const app = new Hono();
    app.get('/items/:id', validateParams(schema), (c) => {
      const data = c.req.valid('param');
      return c.json({ id: data.id });
    });

    const res = await app.request('/items/abc');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { id: string };
    expect(body.id).toBe('abc');
  });
});
