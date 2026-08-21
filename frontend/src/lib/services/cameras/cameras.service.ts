import { apiConfig } from '../../api/config';
import { CamerasApi } from './cameras.api';
import { CamerasDemo } from './cameras.demo';
import { ICamerasService } from './cameras.types';

export const camerasService: ICamerasService = apiConfig.IS_DEMO_MODE 
  ? new CamerasDemo() 
  : new CamerasApi();

export type { ICamerasService };
