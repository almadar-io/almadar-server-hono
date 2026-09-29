/**
 * The event-bus WebSocket is transport-level (a `ws` server on the Node HTTP server), so the Hono
 * stack uses `@almadar/server`'s implementation under its own names.
 */
export {
  setupEventBroadcast as setupHonoEventBroadcast,
  getWebSocketServer as getHonoWebSocketServer,
  closeWebSocketServer as closeHonoWebSocketServer,
  getConnectedClientCount as getHonoConnectedClientCount,
} from '@almadar/server';
