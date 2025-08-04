export interface NotificationSender {
    id: number;
    name: string;
    avatar?: string;
}

export interface NotificationRecipient {
    id: number;
    name: string;
    avatar?: string;
}

export interface Notification {
    id: number;
    sender?: NotificationSender;
    recipient?: NotificationRecipient;
    message: string;
    is_read: boolean;
    redirect_url?: string;
    created_at: string;
}

export interface NotificationListRequest {
    page?: number;
    per_page?: number;
}

export interface NotificationListResponse {
    data: {
        notifications: Notification[];
        pagination: {
            total: number;
            per_page: number;
            current_page: number;
            last_page: number;
        };
    };
}

export interface NotificationReadRequest {
    notification_id: number;
}

export interface NotificationReadResponse {
    message: string;
}

export interface NotificationUnreadCountResponse {
    data: {
        unread_count: number;
    };
}
