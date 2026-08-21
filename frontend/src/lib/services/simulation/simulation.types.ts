export interface SimulationResult {
  status: string;
  results: Record<string, unknown>;
}

export interface ISimulationService {
  runSimulation(payload: unknown): Promise<SimulationResult>;
}
