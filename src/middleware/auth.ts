import { createMiddleware } from 'hono/factory';
import { getAuth, logger, resolveDevIdentity } from '@almadar/server';
import type { FirebaseEnv } from '../types.js';

const BEARER_PREFIX = 'Bearer ';

/**
 * Firebase authentication middleware for Hono.
 * Ports the Express authenticateFirebase from @almadar/server.
 *
 * The dev-bypass identity (fixed dev user, or a persona from the shell's mocked
 * sign-in token) comes from the shared `resolveDevIdentity` so the two servers
 * cannot disagree about who the viewer is.
 */
export const authenticateFirebase = createMiddleware<FirebaseEnv>(async (c, next) => {
  const authorization = c.req.header('Authorization');

  const devUser = resolveDevIdentity(authorization);
  if (devUser) {
    logger.debug(`Dev bypass auth: ${devUser.uid}`);
    c.set('firebaseUser', devUser);
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
