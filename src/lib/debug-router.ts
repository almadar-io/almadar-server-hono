/**
 * Debug Events Router (Hono)
 *
 * Provides diagnostic endpoints for inspecting the server EventBus.
 * Only active when NODE_ENV=development.
 *
 * Endpoints:
 *   GET    /event-log   - Recent emitted events with listener counts
 *   DELETE /event-log   - Clear the event log
 *   GET    /listeners   - Registered listener counts per event
 *   POST   /seed        - Seed MockDataService with entity data
 *
 * @packageDocumentation
 */

import { Hono } from 'hono';
import { getServerEventBus, seedMockData, type EntitySeedConfig, type FieldSchema } from '@almadar/server';

/**
 * Creates a Hono router with debug endpoints for the server EventBus.
 * Returns a router with no routes in production.
 */
export function debugEventsRouter(): Hono {
  const app = new Hono();

  if (process.env.NODE_ENV !== 'development') {
    return app;
  }

  app.get('/event-log', (c) => {
    const limit = parseInt(String(c.req.query('limit') ?? '50'), 10);
    const events = getServerEventBus().getRecentEvents(limit);
    return c.json({ count: events.length, events });
  });

  app.delete('/event-log', (c) => {
    getServerEventBus().clearEventLog();
    return c.json({ cleared: true });
  });

  app.get('/listeners', (c) => {
    const counts = getServerEventBus().getListenerCounts();
    const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
    return c.json({ total, events: counts });
  });

  /**
   * POST /seed - Seed MockDataService with entity data from schema.
   *
   * Body: { entities: Array<{ name: string, fields: FieldSchema[], seedCount?: number }> }
   */
  app.post('/seed', async (c) => {
    const body = await c.req.json<{
      entities?: Array<{ name: string; fields: FieldSchema[]; seedCount?: number }>;
    }>();

    const { entities } = body;

    if (!entities || !Array.isArray(entities)) {
      return c.json({ error: 'Body must have "entities" array' }, 400);
    }

    const configs: EntitySeedConfig[] = entities.map((e) => ({
      name: e.name,
      fields: e.fields,
      seedCount: e.seedCount ?? 5,
    }));

    seedMockData(configs);

    const summary = configs.map((cfg) => `${cfg.name}(${String(cfg.seedCount)})`).join(', ');
    return c.json({ seeded: true, summary });
  });

  return app;
}
