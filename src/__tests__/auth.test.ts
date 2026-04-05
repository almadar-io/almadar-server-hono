import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

// Mock @almadar/server before importing our module
vi.mock('@almadar/server', () => ({
  env: { NODE_ENV: 'development' },
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  getAuth: vi.fn(() => ({
    verifyIdToken: vi.fn().mockResolvedValue({
      uid: 'real-user-123',
      email: 'real@example.com',
      email_verified: true,
      aud: 'test-project',
      auth_time: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      iss: 'https://securetoken.google.com/test-project',
      sub: 'real-user-123',
      firebase: { identities: {}, sign_in_provider: 'password' },
    }),
  })),
}));

import { authenticateFirebase } from '../middleware/auth.js';
import type { FirebaseEnv } from '../types.js';

interface UserResponse {
  uid: string;
  email?: string;
}

describe('authenticateFirebase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('injects dev user in development mode without auth header', async () => {
    const app = new Hono<FirebaseEnv>();
    app.use('*', authenticateFirebase);
    app.get('/test', (c) => {
      const user = c.get('firebaseUser');
      return c.json({ uid: user.uid, email: user.email });
    });

    const res = await app.request('/test');
    expect(res.status).toBe(200);

    const body = (await res.json()) as UserResponse;
    expect(body.uid).toBe('dev-user-001');
    expect(body.email).toBe('dev@localhost');
  });

  it('verifies real token when Authorization header is present', async () => {
    const app = new Hono<FirebaseEnv>();
    app.use('*', authenticateFirebase);
    app.get('/test', (c) => {
      const user = c.get('firebaseUser');
      return c.json({ uid: user.uid });
    });

    const res = await app.request('/test', {
      headers: { Authorization: 'Bearer valid-token-123' },
    });
    expect(res.status).toBe(200);

    const body = (await res.json()) as UserResponse;
    expect(body.uid).toBe('real-user-123');
  });
});
