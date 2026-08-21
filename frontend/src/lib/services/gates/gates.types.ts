export type GateStatus = 'Open' | 'Closed' | 'Exit Only';

export interface Gate {
  id: string;
  eventId?: string;
  name: string;
  type: string;
  status: GateStatus;
}

export interface IGatesService {
  getGates(): Promise<Gate[]>;
  getEventGates(eventId: string): Promise<Gate[]>;
  getGateStatus(gateId: string): Promise<{ status: GateStatus }>;
  openGate(gateId: string): Promise<Gate>;
  closeGate(gateId: string): Promise<Gate>;
}
