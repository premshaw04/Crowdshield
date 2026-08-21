import { apiConfig } from '../../api/config';
import { IncidentsApi } from './incidents.api';
import { IncidentsDemo } from './incidents.demo';
import { IIncidentsService } from './incidents.types';

export const incidentsService: IIncidentsService = apiConfig.IS_DEMO_MODE 
  ? new IncidentsDemo() 
  : new IncidentsApi();

export type { IIncidentsService };
