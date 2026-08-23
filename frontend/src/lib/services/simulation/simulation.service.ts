import { apiConfig } from '../../api/config';
import { ISimulationService } from './simulation.types';
import { SimulationApi } from './simulation.api';

export const simulationService: ISimulationService  = new SimulationApi();
