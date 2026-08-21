export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface INotificationsService {
  getNotifications(): Promise<Notification[]>;
  markAsRead(id: string): Promise<{ id: string, read: boolean }>;
}
