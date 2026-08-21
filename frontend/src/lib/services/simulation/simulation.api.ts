import { apiClient } from '../../api/client';
import { ISimulationService, SimulationResult } from './simulation.types';

export class SimulationApi implements ISimulationService {
  async runSimulation(payload: unknown): Promise<SimulationResult> {
    return apiClient.post<SimulationResult>('/simulation/run', payload);
  }
}
