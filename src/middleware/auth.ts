import { createMiddleware } from 'hono/factory';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { getAuth, env, logger } from '@almadar/server';
import type { FirebaseEnv } from '../types.js';

const BEARER_PREFIX = 'Bearer ';

/** Fake dev user injected ONLY when ALLOW_DEV_AUTH_BYPASS=true and no auth header is present */
const DEV_USER: DecodedIdToken = {
  uid: 'dev-user-001',
  email: 'dev@localhost',
  email_verified: true,
  aud: 'dev-project',
  auth_time: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
  iat: Math.floor(Date.now() / 1000),
  iss: 'https://securetoken.google.com/dev-project',
  sub: 'dev-user-001',
  firebase: {
    identities: {},
    sign_in_provider: 'custom',
  },
};

/**
 * Firebase authentication middleware for Hono.
 * Ports the Express authenticateFirebase from @almadar/server.
 *
 * Dev bypass injects DEV_USER ONLY when ALLOW_DEV_AUTH_BYPASS=true (never keyed on NODE_ENV).
 */
export const authenticateFirebase = createMiddleware<FirebaseEnv>(async (c, next) => {
  const authorization = c.req.header('Authorization');

  // Dev bypass: ONLY when explicitly opted in via ALLOW_DEV_AUTH_BYPASS (fail closed by default)
  if (env.ALLOW_DEV_AUTH_BYPASS === 'true' && (!authorization || !authorization.startsWith(BEARER_PREFIX))) {
    logger.debug('Dev bypass auth');
    c.set('firebaseUser', DEV_USER);
    return await next();
  }

  try {
    if (!authorization || !authorization.startsWith(BEARER_PREFIX)) {
      return c.json({ error: 'Authorization header missing or malformed' }, 401);
    }

    const token = authorization.slice(BEARER_PREFIX.length);
    const decodedToken = await getAuth().verifyIdToken(token);

    logger.info(`Auth verified: ${decodedToken.uid}`);
    c.set('firebaseUser', decodedToken);
    await next();
  } catch (error) {
    logger.warn(`Auth failed: ${error instanceof Error ? error.message : String(error)}`);
    return c.json({ error: 'Unauthorized' }, 401);
  }
});
