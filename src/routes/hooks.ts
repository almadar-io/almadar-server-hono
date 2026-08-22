/**
 * Inbound Webhook Ingress (Hono)
 *
 * `POST /:provider` — one shared entry point for external services that call
 * back into a deployed app (Google Calendar watch channels, e-sign status,
 * banking callbacks, …). Mount OUTSIDE the authenticated `/api` scope: hook
 * senders cannot present a Firebase token; each provider's own verification
 * (signature / channel token) is the auth.
 *
 * See the Express twin in `@almadar/server` for the full contract; providers
 * live in `@almadar/integrations` (the `stripe/webhooks.ts` pattern).
 *
 * @packageDocumentation
 */

import { Hono } from 'hono';
import type { HookProvider, HookDispatch, HooksRouterOptions } from '@almadar/server';

export type { HookProvider, HookDispatch, HooksRouterOptions };

export function createHooksRouter(options: HooksRouterOptions): Hono {
  const app = new Hono();

  app.post('/:provider', async (c) => {
    const providerName = c.req.param('provider');
    const provider = options.providers[providerName];
    if (!provider) {
      return c.json({ error: `Unknown hook provider: ${providerName}` }, 404);
    }

    const rawBody = await c.req.text();
    const headers: Record<string, string | undefined> = {};
    for (const [key, value] of c.req.raw.headers.entries()) {
      headers[key] = value;
    }

    const result = provider({ headers, rawBody });
    if ('error' in result) {
      return c.json({ error: result.error }, 400);
    }
    if ('ack' in result) {
      return c.json({ ok: true, dispatched: false });
    }

    try {
      await options.dispatch(result.event, result.payload);
      return c.json({ ok: true, dispatched: true, event: result.event });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // 500 → the sender retries; dispatch failures are transient by contract.
      return c.json({ error: message }, 500);
    }
  });

  return app;
}
