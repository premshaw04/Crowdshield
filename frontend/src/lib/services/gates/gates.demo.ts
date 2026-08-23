import { auditLogService } from '..';
import { IGatesService, Gate, GateStatus } from './gates.types';

const globalGatesDb: Gate[] = [
  { id: 'g1', name: 'Gate 1', type: 'Entry', status: 'Open' },
  { id: 'g2', name: 'Gate 2', type: 'Entry', status: 'Closed' },
  { id: 'g3', name: 'Gate 3', type: 'Exit', status: 'Open' },
  { id: 'g4', name: 'Gate 4', type: 'Entry', status: 'Open' },
  { id: 'g5', name: 'Gate 5', type: 'Exit', status: 'Open' },
  { id: 'g6', name: 'Gate 6', type: 'Exit', status: 'Exit Only' },
  { id: 'g7', name: 'Gate 7', type: 'Entry', status: 'Open' },
  { id: 'g8', name: 'Gate 8', type: 'Exit', status: 'Closed' },
];

export class GatesDemo implements IGatesService {
  async getGates(): Promise<Gate[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return globalGatesDb;
  }

  async getEventGates(eventId: string): Promise<Gate[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return globalGatesDb.map(g => ({ ...g, eventId }));
  }

  async getGateStatus(gateId: string): Promise<{ status: GateStatus }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const gate = globalGatesDb.find(g => g.id === gateId);
    if (!gate) throw new Error('Gate not found');
    return { status: gate.status };
  }

  async openGate(gateId: string): Promise<Gate> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const idx = globalGatesDb.findIndex(g => g.id === gateId);
    if (idx === -1) throw new Error('Gate not found');
    
    globalGatesDb[idx].status = 'Open';
    
    auditLogService.logAction({
      eventId: 'GLOBAL',
      actor: 'System Admin',
      role: 'Authority',
      action: `Opened ${globalGatesDb[idx].name}`,
      target: globalGatesDb[idx].name,
      result: 'SUCCESS'
    });
    
    return globalGatesDb[idx];
  }

  async closeGate(gateId: string): Promise<Gate> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const idx = globalGatesDb.findIndex(g => g.id === gateId);
    if (idx === -1) throw new Error('Gate not found');
    
    globalGatesDb[idx].status = 'Closed';
    
    auditLogService.logAction({
      eventId: 'GLOBAL',
      actor: 'System Admin',
      role: 'Authority',
      action: `Closed ${globalGatesDb[idx].name}`,
      target: globalGatesDb[idx].name,
      result: 'SUCCESS'
    });
    
    return globalGatesDb[idx];
  }
}
