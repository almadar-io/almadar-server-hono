/**
 * Push Routes (Hono)
 *
 * Mount at `/api/push`. Also exports a root-scope handler for the shared
 * service worker — a service worker's maximum scope is its own directory, so
 * it MUST be served from `/almadar-push-sw.js`, never under `/api`.
 *
 * @packageDocumentation
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import { vapidPublicKey, PUSH_SERVICE_WORKER_SOURCE } from '@almadar/server';

const app = new Hono();

/**
 * GET /vapid-public-key — the browser needs this to call
 * PushManager.subscribe. Public by design (it is the PUBLIC half of the VAPID
 * pair); 404 when push is not configured so the client fails honestly.
 */
app.get('/vapid-public-key', (c) => {
  const publicKey = vapidPublicKey();
  if (!publicKey) {
    return c.json({ error: 'Push is not configured (VAPID_PUBLIC_KEY unset)' }, 404);
  }
  return c.json({ publicKey });
});

export { app as pushRouter };

/** Root-scope handler serving the shared push service worker. */
export function pushServiceWorkerHandler(c: Context): Response {
  return c.body(PUSH_SERVICE_WORKER_SOURCE, 200, { 'Content-Type': 'application/javascript' });
}
