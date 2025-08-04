import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useEffect, useRef } from 'react';
import useAuth from '../store/slices/authSlice';

interface NotificationData {
    id: number;
    type: string;
    message: string;
    redirect_url: string;
    is_read: boolean;
    created_at: string;
    sender?: {
        id: number;
        name: string;
        avatar?: string;
    } | null;
}

interface UseNotificationListenerProps {
    onNotification?: (notification: NotificationData) => void;
    onError?: (error: any) => void;
}

export const useNotificationListener = ({ onNotification, onError }: UseNotificationListenerProps = {}) => {
    const { user } = useAuth();
    const echoRef = useRef<Echo | null>(null);

    useEffect(() => {
        if (!user) return;

        // Initialize Laravel Echo
        if (!window.Echo) {
            window.Pusher = Pusher;

            window.Echo = new Echo({
                broadcaster: 'reverb',
                key: import.meta.env.VITE_REVERB_APP_KEY,
                wsHost: import.meta.env.VITE_REVERB_HOST,
                wsPort: import.meta.env.VITE_REVERB_PORT || 443,
                wssPort: import.meta.env.VITE_REVERB_PORT || 443,
                forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'https') === 'https',
                enabledTransports: ['ws', 'wss'],
                auth: {
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                },
            });
        }

        echoRef.current = window.Echo;

        // Listen for notifications
        const channel = echoRef.current.private(`notifications.${user.id}`);

        channel.listen('.notification.created', (data: NotificationData) => {
            console.log('New notification received:', data);
            onNotification?.(data);
        });

        channel.error((error: any) => {
            console.error('Notification channel error:', error);
            onError?.(error);
        });

        return () => {
            if (echoRef.current) {
                echoRef.current.leave(`notifications.${user.id}`);
            }
        };
    }, [user, onNotification, onError]);

    return {
        echo: echoRef.current,
    };
};
