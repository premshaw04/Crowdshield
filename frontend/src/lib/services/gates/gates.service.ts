import { apiConfig } from '../../api/config';
import { GatesApi } from './gates.api';
import { GatesDemo } from './gates.demo';
import { IGatesService } from './gates.types';

export const gatesService: IGatesService = apiConfig.IS_DEMO_MODE 
  ? new GatesDemo() 
  : new GatesApi();

export type { IGatesService };
