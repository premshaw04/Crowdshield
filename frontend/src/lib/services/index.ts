export { authService } from './auth/auth.service';
export type { User, Role, LoginResponse, AuthCredentials } from './auth/auth.types';

export { eventsService as eventService } from './events/events.service';
export { predictionsService as predictionsApi } from './predictions/predictions.service';
export type { AIPrediction } from './predictions/predictions.types';
export { recommendationsService as recommendationsApi } from './recommendations/recommendations.service';
export type { AIRecommendation } from './recommendations/recommendations.types';
export { auditLogService } from './audit/audit.service';
export type { AuditLogEntry } from './audit/audit.types';

export { camerasService as camerasApi } from './cameras/cameras.service';
export { alertsService as alertsApi } from './alerts/alerts.service';
export type { Alert, AlertStatus, AlertSeverity } from './alerts/alerts.types';
export { incidentsService as incidentsApi } from './incidents/incidents.service';
export type { Incident, IncidentStatus, IncidentSeverity } from './incidents/incidents.types';
export { gatesService as gatesApi } from './gates/gates.service';
export type { Gate, GateStatus } from './gates/gates.types';
export { securityService as securityApi } from './security/security.service';
export type { SecurityDeployment } from './security/security.types';

export { heatmapService as heatmapApi } from './heatmap/heatmap.service';
export type { HeatmapDataPoint, ZoneHeatmapUpdate } from './heatmap/heatmap.types';

export { simulationService as simulationApi } from './simulation/simulation.service';
export type { SimulationResult } from './simulation/simulation.types';

export { reportsService as reportsApi } from './reports/reports.service';
export type { Report } from './reports/reports.types';

export { notificationsService as notificationsApi } from './notifications/notifications.service';
export type { Notification } from './notifications/notifications.types';

export { videosService as videosApi } from './videos/videos.service';
export type { VideoRecord, VideoStatus, UploadVideoPayload } from './videos/videos.types';

export { monitoringService as monitoringApi } from './monitoring/monitoring.service';
export type { MonitoringCamera, MonitoringUpdate, AiMetrics, CameraStatus, RiskLevel } from './monitoring/monitoring.types';

export { geocodingService as geocodingApi } from './geocoding/geocoding.service';
export type { GeocodingResult } from './geocoding/geocoding.types';

export { uploadsService as uploadsApi } from './uploads/uploads.service';
export type { UploadResult } from './uploads/uploads.types';

export { venuesService as venuesApi } from './venues/venues.service';
export type { IVenuesService } from './venues/venues.types';
