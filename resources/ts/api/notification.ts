import {
    NotificationListRequest,
    NotificationListResponse,
    NotificationReadRequest,
    NotificationReadResponse,
    NotificationUnreadCountResponse,
} from '../types/notification';
import { apiClient } from './client';
import { endpoints } from './endpoints';

export const notificationApi = {
    async list(data: NotificationListRequest): Promise<NotificationListResponse> {
        const response = await apiClient.getClient().get<NotificationListResponse>(endpoints.notification_list, { params: data });
        return response.data;
    },

    async read(data: NotificationReadRequest): Promise<NotificationReadResponse> {
        const response = await apiClient.getClient().post<NotificationReadResponse>(`${endpoints.notification_read}/${data.notification_id}/read`);
        return response.data;
    },

    async getUnreadCount(): Promise<NotificationUnreadCountResponse> {
        const response = await apiClient.getClient().get<NotificationUnreadCountResponse>(endpoints.notification_unread_count);
        return response.data;
    },
};
