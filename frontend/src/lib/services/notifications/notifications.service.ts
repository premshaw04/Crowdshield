import { apiConfig } from '../../api/config';
import { INotificationsService } from './notifications.types';
import { NotificationsApi } from './notifications.api';

export const notificationsService: INotificationsService  = new NotificationsApi();
