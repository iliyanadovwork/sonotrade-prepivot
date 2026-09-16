import { useEffect, useRef, useState, useCallback } from 'react';

// Connect to backend WebSocket proxy instead of directly to Dflow
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://sonotrade-v2-production.up.railway.app/ws/orderbook';
const RECONNECT_DELAY = 3000; // 3 seconds
const MAX_RECONNECT_ATTEMPTS = 5;

interface OrderbookData {
  channel: string;
  type: string;
  market_ticker: string;
  yes_bids: Record<string, number>;
  no_bids: Record<string, number>;
}

interface UseOrderbookWebSocketProps {
  enabled: boolean;
  ticker?: string;
  onOrderbookUpdate?: (data: OrderbookData) => void;
}

export function useOrderbookWebSocket({
  enabled,
  ticker,
  onOrderbookUpdate
}: UseOrderbookWebSocketProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subscribedTickersRef = useRef<Set<string>>(new Set());

  const connect = useCallback(() => {
    if (!enabled) {
      return;
    }

    // Don't connect if already connecting or connected
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        wsRef.current = ws;

        // Subscribe to ticker if provided
        if (ticker) {
          ws.send(JSON.stringify({
            type: 'subscribe',
            channel: 'orderbook',
            tickers: [ticker]
          }));
          subscribedTickersRef.current.add(ticker);
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as OrderbookData;

          if (data.channel === 'orderbook' && data.type === 'orderbook') {
            onOrderbookUpdate?.(data);
          }
        } catch (err) {
          console.error('[WebSocket] Failed to parse message:', err);
        }
      };

      ws.onerror = (event) => {
        // WebSocket error events don't contain much detail
        console.warn('[WebSocket] Connection error - check network or server availability');
        setError('WebSocket connection error');
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        wsRef.current = null;
        subscribedTickersRef.current.clear();

        // Attempt to reconnect if enabled and within retry limit
        if (enabled && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, RECONNECT_DELAY);
        } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          setError('Max reconnection attempts reached');
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[WebSocket] Failed to connect:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
    }
  }, [enabled, ticker, onOrderbookUpdate]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      // Unsubscribe from all tickers before closing
      if (subscribedTickersRef.current.size > 0 && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'unsubscribe',
          channel: 'orderbook',
          all: true
        }));
      }

      wsRef.current.close();
      wsRef.current = null;
    }

    subscribedTickersRef.current.clear();
    setIsConnected(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  const subscribe = useCallback((newTicker: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] Cannot subscribe - WebSocket not connected');
      return;
    }

    if (subscribedTickersRef.current.has(newTicker)) {
      return;
    }

    const message = {
      type: 'subscribe',
      channel: 'orderbook',
      tickers: [newTicker]
    };

    wsRef.current.send(JSON.stringify(message));
    subscribedTickersRef.current.add(newTicker);
  }, []);

  const unsubscribe = useCallback((tickerToRemove: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] Cannot unsubscribe - WebSocket not connected');
      return;
    }

    if (!subscribedTickersRef.current.has(tickerToRemove)) {
      return;
    }

    // First unsubscribe from all
    wsRef.current.send(JSON.stringify({
      type: 'unsubscribe',
      channel: 'orderbook',
      all: true
    }));

    // Remove the ticker from our set
    subscribedTickersRef.current.delete(tickerToRemove);

    // Re-subscribe to remaining tickers
    if (subscribedTickersRef.current.size > 0) {
      const remainingTickers = Array.from(subscribedTickersRef.current);
      wsRef.current.send(JSON.stringify({
        type: 'subscribe',
        channel: 'orderbook',
        tickers: remainingTickers
      }));
    }
  }, []);

  // Connect/disconnect based on enabled flag
  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]); // Only re-run when enabled changes, not when connect/disconnect change

  return {
    isConnected,
    error,
    subscribe,
    unsubscribe,
  };
}
