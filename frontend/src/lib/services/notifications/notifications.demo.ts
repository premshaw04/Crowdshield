import { INotificationsService, Notification } from './notifications.types';

export class NotificationsDemo implements INotificationsService {
  async getNotifications(): Promise<Notification[]> {
    return [];
  }

  async markAsRead(id: string): Promise<{ id: string, read: boolean }> {
    return { id, read: true };
  }
}
