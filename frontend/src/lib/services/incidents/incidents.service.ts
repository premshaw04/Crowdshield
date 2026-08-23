import { IncidentsApi } from './incidents.api';
import { IIncidentsService } from './incidents.types';

export const incidentsService: IIncidentsService = new IncidentsApi();

export type { IIncidentsService };
