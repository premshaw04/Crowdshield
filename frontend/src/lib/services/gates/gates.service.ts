import { apiConfig } from '../../api/config';
import { GatesApi } from './gates.api';
import { IGatesService } from './gates.types';

export const gatesService: IGatesService  = new GatesApi();

export type { IGatesService };
