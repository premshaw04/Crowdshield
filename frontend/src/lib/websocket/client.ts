import { apiConfig } from '../api/config';
import { 
  WebSocketConnectionState, 
  WebSocketMessageHandler,
  ConnectionStateHandler,
  WebSocketMessage
} from './events';

export class WebSocketClient {
  private static instances: Map<string, WebSocketClient> = new Map();
  
  private ws: WebSocket | null = null;
  private url: string;
  private endpoint: string;
  private state: WebSocketConnectionState = WebSocketConnectionState.DISCONNECTED;
  
  // Reconnection state
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 7; // Cap backoff around 1-2 minutes total
  private baseBackoffMs = 1000;
  private maxBackoffMs = 30000; // Cap single reconnect delay to 30s
  private reconnectTimeoutId: NodeJS.Timeout | null = null;
  private intentionallyClosed = false;

  // Pub/Sub listeners
  private messageListeners: Map<string, Set<WebSocketMessageHandler>> = new Map();
  private stateListeners: Set<ConnectionStateHandler> = new Set();
  
  private constructor(endpoint: string = '/global') {
    this.endpoint = endpoint;
    const baseUrl = apiConfig.WS_BASE_URL || 'ws://localhost:8000/ws';
    // Ensure no double slashes
    this.url = `${baseUrl.replace(/\/$/, '')}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }

  /**
   * Retrieves the singleton instance of the WebSocketClient.
   * Prevents duplicate connections globally.
   */
  public static getInstance(endpoint: string = '/global'): WebSocketClient {
    if (!WebSocketClient.instances.has(endpoint)) {
      WebSocketClient.instances.set(endpoint, new WebSocketClient(endpoint));
    }
    return WebSocketClient.instances.get(endpoint)!;
  }

  /**
   * Disconnects and totally destroys the instance for the given endpoint.
   */
  public static destroyInstance(endpoint: string = '/global'): void {
    const instance = WebSocketClient.instances.get(endpoint);
    if (instance) {
      instance.disconnect();
      WebSocketClient.instances.delete(endpoint);
    }
  }

  public connect(): void {
    if (this.state === WebSocketConnectionState.CONNECTED || this.state === WebSocketConnectionState.CONNECTING) {
      return; // Already active
    }

    this.intentionallyClosed = false;
    this.updateState(WebSocketConnectionState.CONNECTING);

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
    } catch (error) {
      console.error('Failed to instantiate WebSocket:', error);
      this.handleError();
    }
  }

  public disconnect(): void {
    this.intentionallyClosed = true;
    this.clearReconnectTimeout();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnected intentionally');
      this.ws = null;
    }
    
    this.updateState(WebSocketConnectionState.DISCONNECTED);
  }

  public subscribe(eventType: string, handler: WebSocketMessageHandler): () => void {
    if (!this.messageListeners.has(eventType)) {
      this.messageListeners.set(eventType, new Set());
    }
    
    this.messageListeners.get(eventType)!.add(handler);

    // Return an unsubscribe function specifically for this listener
    return () => {
      this.unsubscribe(eventType, handler);
    };
  }

  public unsubscribe(eventType: string, handler: WebSocketMessageHandler): void {
    const listeners = this.messageListeners.get(eventType);
    if (listeners) {
      listeners.delete(handler);
      if (listeners.size === 0) {
        this.messageListeners.delete(eventType);
      }
    }
  }

  public onStateChange(handler: ConnectionStateHandler): () => void {
    this.stateListeners.add(handler);
    // Immediately emit current state
    handler(this.state);
    
    return () => {
      this.stateListeners.delete(handler);
    };
  }

  public getState(): WebSocketConnectionState {
    return this.state;
  }

  public send(message: WebSocketMessage): boolean {
    if (this.ws && this.state === WebSocketConnectionState.CONNECTED) {
      try {
        this.ws.send(JSON.stringify(message));
        return true;
      } catch (err) {
        console.error('WebSocket send error:', err);
        return false;
      }
    }
    return false;
  }

  // --- Internal Handlers ---

  private handleOpen(): void {
    this.reconnectAttempts = 0; // Reset backoff
    this.updateState(WebSocketConnectionState.CONNECTED);
  }

  private handleMessage(event: MessageEvent): void {
    try {
      // Try to parse the JSON data, but fallback to raw data if needed
      let parsed: unknown;
      try {
        parsed = JSON.parse(event.data);
      } catch {
        parsed = event.data;
      }
      
      // Route message to subscribers of this specific type if it exists
      if (parsed && typeof parsed === 'object' && 'type' in parsed) {
        const typeListeners = this.messageListeners.get((parsed as any).type);
        if (typeListeners) {
          typeListeners.forEach(handler => handler(parsed as WebSocketMessage));
        }
      }

      // ALWAYS route to wildcard listeners (*), even if type is missing or parsing failed
      const allListeners = this.messageListeners.get('*');
      if (allListeners) {
        allListeners.forEach(handler => handler(parsed as WebSocketMessage));
      }
    } catch (err) {
      console.warn('Failed to handle incoming WebSocket message:', err);
    }
  }

  /**
   * Helper for Demo Mode to simulate incoming messages from the backend.
   */
  public simulateMessage(message: WebSocketMessage): void {
    if (message && message.type) {
      const typeListeners = this.messageListeners.get(message.type);
      if (typeListeners) {
        typeListeners.forEach(handler => handler(message));
      }
      const allListeners = this.messageListeners.get('*');
      if (allListeners) {
        allListeners.forEach(handler => handler(message));
      }
    }
  }

  private handleClose(event: CloseEvent): void {
    if (this.intentionallyClosed) {
      this.updateState(WebSocketConnectionState.DISCONNECTED);
      return;
    }

    this.updateState(WebSocketConnectionState.DISCONNECTED);
    this.scheduleReconnect();
  }

  private handleError(): void {
    this.updateState(WebSocketConnectionState.ERROR);
    // onclose will fire immediately after onerror in most cases, 
    // which will trigger the reconnect logic.
  }

  private scheduleReconnect(): void {
    if (this.intentionallyClosed) return;
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('WebSocket max reconnect attempts reached. Giving up.');
      this.updateState(WebSocketConnectionState.ERROR);
      return;
    }

    this.updateState(WebSocketConnectionState.RECONNECTING);
    
    // Exponential backoff with jitter
    const backoff = Math.min(
      this.maxBackoffMs,
      this.baseBackoffMs * Math.pow(2, this.reconnectAttempts)
    );
    const jitter = Math.random() * 500;
    const delay = backoff + jitter;

    this.reconnectAttempts++;

    this.clearReconnectTimeout();
    this.reconnectTimeoutId = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
  }

  private updateState(newState: WebSocketConnectionState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.stateListeners.forEach(handler => handler(this.state));
    }
  }
}
