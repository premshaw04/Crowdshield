import { useEffect, useState } from 'react';
import { WebSocketClient } from '../lib/websocket/client';
import { WebSocketEventType, WebSocketConnectionState, WebSocketMessage } from '../lib/websocket/events';

export function useWebSocket<T>(topic: WebSocketEventType | string) {
  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const ws = WebSocketClient.getInstance();
    
    // Connect if not already connected
    if (ws.getState() === WebSocketConnectionState.DISCONNECTED) {
      ws.connect();
    }

    // Listen to connection state
    const unsubscribeState = ws.onStateChange((state) => {
      setIsConnected(state === WebSocketConnectionState.CONNECTED);
    });

    // Listen to topic messages
    const handler = (message: WebSocketMessage) => {
      setData(message.payload as T);
    };

    const unsubscribeMessage = ws.subscribe(topic, handler);

    return () => {
      unsubscribeMessage();
      unsubscribeState();
    };
  }, [topic]);

  const send = (payload: unknown) => {
    const ws = WebSocketClient.getInstance();
    ws.send({
      type: topic,
      payload
    });
  };

  return { data, isConnected, send };
}
