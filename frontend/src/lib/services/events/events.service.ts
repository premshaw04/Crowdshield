import { apiConfig } from '../../api/config';
import { EventsApi } from './events.api';
import { IEventsService } from './events.types';

export const eventsService: IEventsService = new EventsApi();

export type { IEventsService };
