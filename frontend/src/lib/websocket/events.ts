export enum WebSocketConnectionState {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR'
}

export enum WebSocketEventType {
  CROWD_UPDATE = 'crowd_update',
  RISK_UPDATE = 'risk_update',
  HEATMAP_UPDATE = 'heatmap_update',
  ALERT_CREATED = 'alert_created',
  INCIDENT_CREATED = 'incident_created',
  RECOMMENDATION_CREATED = 'recommendation_created',
  GATE_STATUS_CHANGED = 'gate_status_changed',
  SECURITY_UPDATE = 'security_update',
  CAMERA_STATUS_CHANGED = 'camera_status_changed',
  EVENT_STATUS_CHANGED = 'event_status_changed'
}

export interface WebSocketMessage<T = unknown> {
  type: WebSocketEventType | string;
  payload: T;
  timestamp?: string;
  eventId?: string;
}

export type WebSocketMessageHandler = (message: WebSocketMessage) => void;
export type ConnectionStateHandler = (state: WebSocketConnectionState) => void;
