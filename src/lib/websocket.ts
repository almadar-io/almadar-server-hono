import { WebSocketServer, WebSocket, type RawData } from 'ws';
import type { Server } from 'http';
import type { EventPayload } from '@almadar/core';
import { getServerEventBus, logger } from '@almadar/server';

let wss: WebSocketServer | null = null;

export function setupHonoEventBroadcast(server: Server, path: string = '/ws/events'): WebSocketServer {
  if (wss) {
    logger.warn('[HonoWebSocket] Server already initialized');
    return wss;
  }

  wss = new WebSocketServer({ server, path });
  logger.info(`[HonoWebSocket] Server listening at ${path}`);

  wss.on('connection', (ws: WebSocket, req) => {
    const clientId = (req.headers['sec-websocket-key'] as string | undefined) ?? 'unknown';
    logger.debug(`[HonoWebSocket] Client connected: ${clientId}`);

    ws.send(
      JSON.stringify({
        type: 'CONNECTED',
        timestamp: Date.now(),
        message: 'Connected to event stream',
      })
    );

    ws.on('message', (data: RawData) => {
      try {
        const message = JSON.parse(data.toString()) as { type?: string; payload?: unknown };
        if (
          message.type &&
          message.payload !== undefined &&
          message.payload !== null &&
          typeof message.payload === 'object'
        ) {
          getServerEventBus().emit(message.type, message.payload as EventPayload, {
            orbital: 'client',
            trait: clientId,
          });
        }
      } catch (error) {
        logger.error('[HonoWebSocket] Failed to parse message:', {
          error: error instanceof Error ? error : String(error),
        });
      }
    });

    ws.on('close', () => logger.debug(`[HonoWebSocket] Client disconnected: ${clientId}`));
    ws.on('error', (error: Error) => logger.error('[HonoWebSocket] Client error:', { error }));
  });

  getServerEventBus().on('*', (event) => {
    if (!wss) return;
    const message = JSON.stringify({
      type: event.type,
      payload: event.payload,
      timestamp: event.timestamp,
      source: event.source,
    });
    let broadcastCount = 0;
    wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
        broadcastCount++;
      }
    });
    if (broadcastCount > 0) {
      logger.debug(`[HonoWebSocket] Broadcast ${event.type} to ${broadcastCount} client(s)`);
    }
  });

  return wss;
}

export function getHonoWebSocketServer(): WebSocketServer | null {
  return wss;
}

export function closeHonoWebSocketServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!wss) {
      resolve();
      return;
    }
    wss.close((err?: Error) => {
      if (err) {
        reject(err);
      } else {
        wss = null;
        resolve();
      }
    });
  });
}

export function getHonoConnectedClientCount(): number {
  return wss?.clients.size ?? 0;
}
