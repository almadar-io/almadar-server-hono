/**
 * Observability Routes (Hono)
 *
 * Provides endpoints for metrics, health checks, and telemetry.
 * Requires @almadar-io/agent as an optional peer dependency.
 *
 * @packageDocumentation
 */

import { Hono } from 'hono';

async function getObservabilityCollector() {
  const mod = await import('@almadar-io/agent');
  return mod.getObservabilityCollector();
}

const app = new Hono();

/**
 * GET /metrics - Get performance snapshot
 */
app.get('/metrics', async (c) => {
  try {
    const collector = await getObservabilityCollector();
    const snapshot = collector.getPerformanceSnapshot();
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
    const collector = await getObservabilityCollector();
    const health = await collector.healthCheck();
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
  try {
    const collector = await getObservabilityCollector();
    const telemetry = collector.getSessionTelemetry(c.req.param('threadId'));

    if (!telemetry) {
      return c.json({ error: 'Session not found' }, 404);
    }

    return c.json(telemetry);
  } catch (error) {
    console.error('Telemetry error:', error);
    return c.json({ error: 'Failed to get telemetry' }, 500);
  }
});

/**
 * GET /active-sessions - Get active sessions
 */
app.get('/active-sessions', async (c) => {
  try {
    const collector = await getObservabilityCollector();
    const sessions = collector.getActiveSessions();
    return c.json(sessions);
  } catch (error) {
    console.error('Active sessions error:', error);
    return c.json({ error: 'Failed to get active sessions' }, 500);
  }
});

export { app as observabilityRouter };
export default app;
