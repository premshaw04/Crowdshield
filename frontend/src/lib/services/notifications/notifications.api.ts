import { apiClient } from '../../api/client';
import { INotificationsService, Notification } from './notifications.types';

export class NotificationsApi implements INotificationsService {
  async getNotifications(): Promise<Notification[]> {
    return apiClient.get<Notification[]>('/notifications');
  }

  async markAsRead(id: string): Promise<{ id: string, read: boolean }> {
    return apiClient.patch<{ id: string, read: boolean }>(`/notifications/${id}/read`);
  }
}
