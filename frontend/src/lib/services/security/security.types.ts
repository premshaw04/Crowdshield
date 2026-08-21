export interface SecurityDeployment {
  id: string;
  eventId?: string;
  zone: string;
  staffCount: number;
  status: 'ACTIVE' | 'PENDING' | 'CANCELLED';
}

export interface ISecurityService {
  getDeployments(): Promise<SecurityDeployment[]>;
  getEventSecurity(eventId: string): Promise<SecurityDeployment[]>;
  deploySecurity(payload: { eventId?: string; zone: string; staffCount: number }): Promise<SecurityDeployment>;
  cancelDeployment(deploymentId: string): Promise<SecurityDeployment>;
}
