import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import axios from 'axios';
import { useEffect, useRef } from 'react';
import { selectUser } from '../store/slices/authSlice';
import { useSelector } from 'react-redux';

// Ensure TypeScript recognizes Pusher globally
declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: any;
    }
}

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
    const user = useSelector(selectUser);
    const echoRef = useRef<any>(null);

    useEffect(() => {
        if (!user) return;
        // Initialize Laravel Echo
        if (!window.Echo) {
            window.Pusher = Pusher;
            const token = localStorage.getItem('auth_token');
            console.log('token', token);
            if (!token) {
                return;
            }
            window.Echo = new Echo({
                broadcaster: 'reverb',
                authorizer: (channel: any, options: any) => {
                    const url = (import.meta as any).env.VITE_API_URL + '/broadcasting/auth';
                    console.log('url', url);
                    return {
                        authorize: (socketId: string, callback: any) => {
                            console.log('Authorizing channel:', channel.name, 'socket:', socketId);
                            axios
                                .post(url, {
                                    socket_id: socketId,
                                    channel_name: channel.name,
                                }, {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                })
                                .then((response) => {
                                    console.log('Broadcasting auth successful:', response.data);
                                    callback(null, response.data);
                                })
                                .catch((error) => {
                                    console.error('Broadcasting auth failed:', error.response?.data || error.message);
                                    callback(error, null);
                                });
                        },
                    };
                },
                key: (import.meta as any).env.VITE_REVERB_APP_KEY as string || 'your-reverb-key',
                wsHost: (import.meta as any).env.VITE_REVERB_HOST as string || 'localhost',
                wsPort: ((import.meta as any).env.VITE_REVERB_PORT as unknown as number) ?? 8080,
                wssPort: ((import.meta as any).env.VITE_REVERB_PORT as unknown as number) ?? 8080,
                forceTLS: false,
                enabledTransports: ['ws'],
            });
        }

        echoRef.current = window.Echo;
        console.log('echoRef.current', user?.id);
        // Listen for notifications
        const channel = echoRef.current.private('notifications.' + user.id);
        console.log('channel', channel);
        channel.listen('.notification.created', (data: NotificationData) => {
            console.log('New notification received:', data);
            onNotification?.(data);
        });

        channel.error((error: any) => {
            console.error('Notification channel error:', error);
            onError?.(error);
        });

        return () => {
            if (window.Echo) {
                window.Echo.leave('notifications');
            }
        };
    }, [onNotification, onError]);

    return {
        echo: window.Echo,
    };
};