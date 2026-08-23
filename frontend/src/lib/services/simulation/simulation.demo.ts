import { ISimulationService, SimulationResult } from './simulation.types';

export class SimulationDemo implements ISimulationService {
  async runSimulation(payload: unknown): Promise<SimulationResult> {
    return { status: 'completed', results: {} };
  }
}
