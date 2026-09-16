import WebSocket from 'ws';
import { Server as HttpServer } from 'http';
import dotenv from 'dotenv';

dotenv.config();

const DFLOW_API_KEY = process.env.DFLOW_API_KEY;
const DFLOW_WS_URL = process.env.DFLOW_WS_URL || 'wss://prediction-markets-api.dflow.net/api/v1/ws';

// Singleton Dflow WebSocket connection shared across all clients
let dflowWs: WebSocket | null = null;
let dflowReconnectTimeout: NodeJS.Timeout | null = null;
const clients = new Set<WebSocket>();

function connectToDflow() {
  if (dflowWs && (dflowWs.readyState === WebSocket.OPEN || dflowWs.readyState === WebSocket.CONNECTING)) {
    console.log('[WS Proxy] Already connected or connecting to Dflow');
    return;
  }

  console.log('[WS Proxy] Connecting to Dflow WebSocket...');

  try {
    dflowWs = new WebSocket(DFLOW_WS_URL, {
      headers: {
        'x-api-key': DFLOW_API_KEY || '',
      }
    });

    dflowWs.on('open', () => {
      console.log('[WS Proxy] ✅ Connected to Dflow WebSocket');
      if (dflowReconnectTimeout) {
        clearTimeout(dflowReconnectTimeout);
        dflowReconnectTimeout = null;
      }
    });

    dflowWs.on('message', (data: WebSocket.Data) => {
      // Broadcast to all connected clients
      const message = data.toString();

      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });

    dflowWs.on('error', (error) => {
      console.error('[WS Proxy] Dflow WebSocket error:', error.message);
    });

    dflowWs.on('close', (code, reason) => {
      const reasonStr = reason.toString();
      console.log(`[WS Proxy] Dflow WebSocket closed: ${code} ${reasonStr}`);
      dflowWs = null;

      // Reconnect after 5 seconds if there are still clients connected
      if (clients.size > 0) {
        console.log('[WS Proxy] Reconnecting to Dflow in 5 seconds...');
        dflowReconnectTimeout = setTimeout(() => {
          connectToDflow();
        }, 5000);
      }
    });

  } catch (error) {
    console.error('[WS Proxy] Failed to connect to Dflow:', error);
    dflowWs = null;
  }
}

export function setupWebSocketProxy(server: HttpServer) {
  const wss = new WebSocket.Server({
    server,
    path: '/ws/orderbook'
  });

  console.log('🔌 WebSocket proxy server initialized at /ws/orderbook');

  wss.on('connection', (clientWs: WebSocket) => {
    console.log('[WS Proxy] Client connected (Total clients:', clients.size + 1, ')');

    // Add client to set
    clients.add(clientWs);

    // Connect to Dflow if not already connected
    if (!dflowWs || dflowWs.readyState !== WebSocket.OPEN) {
      connectToDflow();
    }

    // Forward messages from client to Dflow
    clientWs.on('message', (data: WebSocket.Data) => {
      const message = data.toString();

      if (dflowWs && dflowWs.readyState === WebSocket.OPEN) {
        dflowWs.send(message);
      } else {
        console.warn('[WS Proxy] Cannot forward message - Dflow WebSocket not ready');
        clientWs.send(JSON.stringify({
          type: 'error',
          message: 'Upstream connection not ready'
        }));
      }
    });

    clientWs.on('close', () => {
      console.log('[WS Proxy] Client disconnected (Remaining clients:', clients.size - 1, ')');
      clients.delete(clientWs);

      // If no more clients, close Dflow connection after a delay
      if (clients.size === 0) {
        console.log('[WS Proxy] No more clients, closing Dflow connection in 10 seconds...');
        setTimeout(() => {
          if (clients.size === 0 && dflowWs) {
            console.log('[WS Proxy] Closing Dflow connection');
            dflowWs.close();
            dflowWs = null;
          }
        }, 10000);
      }
    });

    clientWs.on('error', (error) => {
      console.error('[WS Proxy] Client WebSocket error:', error.message);
      clients.delete(clientWs);
    });
  });

  wss.on('error', (error) => {
    console.error('[WS Proxy] Server error:', error);
  });

  return wss;
}
