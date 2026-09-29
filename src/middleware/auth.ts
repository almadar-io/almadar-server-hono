import { createMiddleware } from 'hono/factory';
import type { Context } from 'hono';
import { authenticateBearer } from '@almadar/server';
import type { FirebaseEnv } from '../types.js';

/** Returns the Identity Platform tenant whose users may call this request's app, or null when it has none. */
export type HonoTenantOf = (c: Context<FirebaseEnv>) => string | null;

/**
 * Firebase authentication for Hono: an adapter over `@almadar/server`'s `authenticateBearer`, the
 * same verification (dev bypass, project vs tenant tokens) the Express middlewares use, so the two
 * servers cannot disagree about who the viewer is.
 */
function firebaseAuth(tenantOf: HonoTenantOf | null) {
  return createMiddleware<FirebaseEnv>(async (c, next) => {
    const tenant = tenantOf ? (tenantOf(c) ?? undefined) : null;
    const outcome = await authenticateBearer(c.req.header('Authorization'), tenant);
    if (!outcome.ok) return c.json({ error: outcome.error }, outcome.status);
    c.set('firebaseUser', outcome.user);
    await next();
  });
}

/** Project-level routes (the Studio's own users); a published app's tenant tokens are refused. */
export const authenticateFirebase = firebaseAuth(null);

/** Routes of a published app: tokens must belong to the app's Identity Platform tenant. */
export function authenticateFirebaseForTenant(tenantOf: HonoTenantOf) {
  return firebaseAuth(tenantOf);
}
