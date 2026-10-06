/**
 * The Hono auth middlewares are adapters over `@almadar/server`'s `authenticateBearer`, the one
 * verification the Express middlewares use too (its rules — dev bypass, project vs tenant tokens —
 * are tested there). Here: each middleware passes the right tenant, sets the user on success and
 * answers the outcome's status on refusal.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

const authenticateBearer = vi.fn();

vi.mock('@almadar/server', () => ({
  authenticateBearer: (authorization: string | undefined, tenant: string | null | undefined) => authenticateBearer(authorization, tenant),
}));

import { authenticateFirebase, authenticateFirebaseForTenant, identifyBearer } from '../middleware/auth.js';
import type { FirebaseEnv } from '../types.js';

function app(middleware: typeof authenticateFirebase) {
  const hono = new Hono<FirebaseEnv>();
  hono.use('*', middleware);
  hono.get('/me', (c) => c.json({ uid: c.get('authUser')?.uid ?? null }));
  return hono;
}

beforeEach(() => {
  authenticateBearer.mockReset();
});

describe('authenticateFirebase (project-level)', () => {
  it('verifies the bearer as a project token and sets the user', async () => {
    authenticateBearer.mockResolvedValue({ ok: true, user: { uid: 'real-user-123' } });
    const res = await app(authenticateFirebase).request('/me', { headers: { Authorization: 'Bearer t' } });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ uid: 'real-user-123' });
    expect(authenticateBearer).toHaveBeenCalledWith('Bearer t', null);
  });

  it('control: a refused bearer answers the outcome status and error', async () => {
    authenticateBearer.mockResolvedValue({ ok: false, status: 401, error: 'Unauthorized' });
    const res = await app(authenticateFirebase).request('/me', { headers: { Authorization: 'Bearer t' } });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Unauthorized' });
  });
});

describe('authenticateFirebaseForTenant', () => {
  it('passes the tenant resolved for the request', async () => {
    authenticateBearer.mockResolvedValue({ ok: true, user: { uid: 'alice' } });
    const res = await app(authenticateFirebaseForTenant(() => 'tenant-a')).request('/me', { headers: { Authorization: 'Bearer t' } });
    expect(res.status).toBe(200);
    expect(authenticateBearer).toHaveBeenCalledWith('Bearer t', 'tenant-a');
  });

  it('edge: a request that belongs to no tenant is passed as undefined (always refused)', async () => {
    authenticateBearer.mockResolvedValue({ ok: false, status: 401, error: 'This app has no sign-in tenant' });
    const res = await app(authenticateFirebaseForTenant(() => null)).request('/me', { headers: { Authorization: 'Bearer t' } });
    expect(res.status).toBe(401);
    expect(authenticateBearer).toHaveBeenCalledWith('Bearer t', undefined);
  });
});

describe('identifyBearer (routes open to anonymous visitors)', () => {
  it('no credential is anonymous and never verified', async () => {
    const res = await app(identifyBearer).request('/me');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ uid: null });
    expect(authenticateBearer).not.toHaveBeenCalled();
  });

  it('a valid bearer is the verified user', async () => {
    authenticateBearer.mockResolvedValue({ ok: true, user: { uid: 'alice' } });
    const res = await app(identifyBearer).request('/me', { headers: { Authorization: 'Bearer t' } });
    expect(await res.json()).toEqual({ uid: 'alice' });
    expect(authenticateBearer).toHaveBeenCalledWith('Bearer t', null);
  });

  it('control: a credential that fails is refused, not downgraded to anonymous', async () => {
    authenticateBearer.mockResolvedValue({ ok: false, status: 401, error: 'Unauthorized' });
    const res = await app(identifyBearer).request('/me', { headers: { Authorization: 'Bearer bad' } });
    expect(res.status).toBe(401);
  });
});
