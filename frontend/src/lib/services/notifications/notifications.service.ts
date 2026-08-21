import { apiConfig } from '../../api/config';
import { INotificationsService } from './notifications.types';
import { NotificationsApi } from './notifications.api';
import { NotificationsDemo } from './notifications.demo';

export const notificationsService: INotificationsService = apiConfig.IS_DEMO_MODE 
  ? new NotificationsDemo() 
  : new NotificationsApi();
