import { api } from './api';

export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  notification_type: 'job_match' | 'application_update' | 'message' | 'interview' | 'profile_view' | 'job_alert' | 'system';
  is_read: boolean;
  is_important: boolean;
  action_url?: string;
  metadata?: string;
  user_id: number;
  created_at: string;
  read_at?: string;
}

class NotificationService {
  async getNotifications(): Promise<NotificationResponse[]> {
    try {
      const response = await api.get<NotificationResponse[]>('/notifications/');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async markAsRead(notificationId: number): Promise<NotificationResponse> {
    try {
      const response = await api.put<NotificationResponse>(`/notifications/${notificationId}`, {
        is_read: true,
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to mark notification as read';
      throw new Error(errorMessage);
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await api.post('/notifications/mark-all-read');
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      // Don't throw error for this operation
    }
  }

  async deleteNotification(notificationId: number): Promise<void> {
    try {
      await api.delete(`/notifications/${notificationId}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to delete notification';
      throw new Error(errorMessage);
    }
  }

  async getUnreadCount(): Promise<{ count: number }> {
    try {
      const response = await api.get<{ count: number }>('/notifications/unread-count');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching unread count:', error);
      return { count: 0 };
    }
  }
}

export const notificationService = new NotificationService();