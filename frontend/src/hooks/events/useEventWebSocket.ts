import { useState, useEffect } from 'react';
import { WebSocketClient } from '@/lib/websocket/client';
import { WebSocketConnectionState, WebSocketEventType, WebSocketMessage } from '@/lib/websocket/events';

// These generic types can be mapped to real types from the services as the app grows
export function useEventWebSocket(eventId: string) {
  const [connectionStatus, setConnectionStatus] = useState<WebSocketConnectionState>(WebSocketConnectionState.DISCONNECTED);
  
  // Isolated state for each event type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [latestCrowdMetrics, setLatestCrowdMetrics] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [latestRisk, setLatestRisk] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [latestHeatmap, setLatestHeatmap] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [latestAlert, setLatestAlert] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [latestIncident, setLatestIncident] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [latestRecommendation, setLatestRecommendation] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [latestGateStatus, setLatestGateStatus] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [latestSecurityUpdate, setLatestSecurityUpdate] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [latestCameraStatus, setLatestCameraStatus] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [latestEventStatus, setLatestEventStatus] = useState<any>(null);

  useEffect(() => {
    if (!eventId) return;

    // Connect to global socket (or event-specific endpoint if implemented)
    const ws = WebSocketClient.getInstance(`/${eventId}`);
    
    if (ws.getState() === WebSocketConnectionState.DISCONNECTED) {
      ws.connect();
    }

    // Bind Connection State
    const unsubscribeState = ws.onStateChange(setConnectionStatus);

    // Bind all 10 event topics
    const unsubscribeCrowd = ws.subscribe(WebSocketEventType.CROWD_UPDATE, (msg: WebSocketMessage) => setLatestCrowdMetrics(msg.payload));
    const unsubscribeRisk = ws.subscribe(WebSocketEventType.RISK_UPDATE, (msg: WebSocketMessage) => setLatestRisk(msg.payload));
    const unsubscribeHeatmap = ws.subscribe(WebSocketEventType.HEATMAP_UPDATE, (msg: WebSocketMessage) => setLatestHeatmap(msg.payload));
    const unsubscribeAlert = ws.subscribe(WebSocketEventType.ALERT_CREATED, (msg: WebSocketMessage) => setLatestAlert(msg.payload));
    const unsubscribeIncident = ws.subscribe(WebSocketEventType.INCIDENT_CREATED, (msg: WebSocketMessage) => setLatestIncident(msg.payload));
    const unsubscribeRec = ws.subscribe(WebSocketEventType.RECOMMENDATION_CREATED, (msg: WebSocketMessage) => setLatestRecommendation(msg.payload));
    const unsubscribeGate = ws.subscribe(WebSocketEventType.GATE_STATUS_CHANGED, (msg: WebSocketMessage) => setLatestGateStatus(msg.payload));
    const unsubscribeSecurity = ws.subscribe(WebSocketEventType.SECURITY_UPDATE, (msg: WebSocketMessage) => setLatestSecurityUpdate(msg.payload));
    const unsubscribeCamera = ws.subscribe(WebSocketEventType.CAMERA_STATUS_CHANGED, (msg: WebSocketMessage) => setLatestCameraStatus(msg.payload));
    const unsubscribeEvent = ws.subscribe(WebSocketEventType.EVENT_STATUS_CHANGED, (msg: WebSocketMessage) => setLatestEventStatus(msg.payload));

    // Cleanup: Unregister all listeners when eventId changes or component unmounts
    return () => {
      unsubscribeState();
      unsubscribeCrowd();
      unsubscribeRisk();
      unsubscribeHeatmap();
      unsubscribeAlert();
      unsubscribeIncident();
      unsubscribeRec();
      unsubscribeGate();
      unsubscribeSecurity();
      unsubscribeCamera();
      unsubscribeEvent();
    };
  }, [eventId]);

  return {
    connectionStatus,
    latestCrowdMetrics,
    latestRisk,
    latestHeatmap,
    latestAlert,
    latestIncident,
    latestRecommendation,
    latestGateStatus,
    latestSecurityUpdate,
    latestCameraStatus,
    latestEventStatus
  };
}
