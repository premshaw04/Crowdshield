import { apiConfig } from '../../api/config';
import { ISimulationService } from './simulation.types';
import { SimulationApi } from './simulation.api';
import { SimulationDemo } from './simulation.demo';

export const simulationService: ISimulationService = apiConfig.IS_DEMO_MODE 
  ? new SimulationDemo() 
  : new SimulationApi();
