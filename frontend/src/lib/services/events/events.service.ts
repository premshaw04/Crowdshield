import { apiConfig } from '../../api/config';
import { EventsApi } from './events.api';
import { EventsDemo } from './events.demo';
import { IEventsService } from './events.types';

export const eventsService: IEventsService = apiConfig.IS_DEMO_MODE 
  ? new EventsDemo() 
  : new EventsApi();

export type { IEventsService };
