import { apiConfig } from '../../api/config';
import { CamerasApi } from './cameras.api';
import { ICamerasService } from './cameras.types';

export const camerasService: ICamerasService  = new CamerasApi();

export type { ICamerasService };
