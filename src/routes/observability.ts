/**
 * Observability Routes (Hono)
 *
 * Provides endpoints for metrics, health checks, and telemetry.
 * The DeepAgent observability collector dependency has been removed;
 * these endpoints now return server-native metrics.
 *
 * @packageDocumentation
 */

import { Hono } from 'hono';

const app = new Hono();

/**
 * GET /metrics - Get performance snapshot
 */
app.get('/metrics', async (c) => {
  try {
    const snapshot = {
      uptime: process.uptime(),
      requestCount: 0,
      memory: process.memoryUsage(),
      timestamp: Date.now(),
    };
    return c.json(snapshot);
  } catch (error) {
    console.error('Metrics error:', error);
    return c.json({ error: 'Failed to get metrics' }, 500);
  }
});

/**
 * GET /health - Get health check
 */
app.get('/health', async (c) => {
  try {
    const health = [{ status: 'healthy', name: 'server', timestamp: Date.now() }];
    const allHealthy = health.every((h) => h.status === 'healthy');

    return c.json(
      {
        status: allHealthy ? 'healthy' : 'degraded',
        timestamp: Date.now(),
        checks: health,
      },
      allHealthy ? 200 : 503,
    );
  } catch (error) {
    console.error('Health check error:', error);
    return c.json({ status: 'unhealthy', error: 'Health check failed' }, 500);
  }
});

/**
 * GET /sessions/:threadId/telemetry - Get session telemetry
 */
app.get('/sessions/:threadId/telemetry', async (c) => {
  return c.json(
    {
      error: 'Session telemetry is deprecated. Use @almadar-io/rabit trace events instead.',
    },
    501,
  );
});

/**
 * GET /active-sessions - Get active sessions
 */
app.get('/active-sessions', async (c) => {
  return c.json(
    {
      error: 'Active sessions tracking is deprecated. Use @almadar-io/rabit SessionStore instead.',
    },
    501,
  );
});

export { app as observabilityRouter };
export default app;
