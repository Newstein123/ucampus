import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';

// Ensure TypeScript recognizes Pusher globally
declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo | null;
    }
}

interface EchoChannel {
    name: string;
    listen: (event: string, callback: (data: NotificationData) => void) => void;
    error: (callback: (error: Error) => void) => void;
}

interface Echo {
    private: (channel: string) => EchoChannel;
    leave: (channel: string) => void;
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
    onError?: (error: Error | unknown) => void;
}

export const useNotificationListener = ({ onNotification, onError }: UseNotificationListenerProps = {}) => {
    const user = useSelector(selectUser);
    const echoRef = useRef<Echo | null>(null);

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
                authorizer: (channel: { name: string }) => {
                    const url = import.meta.env.VITE_API_URL + '/broadcasting/auth';
                    console.log('url', url);
                    return {
                        authorize: (socketId: string, callback: (error: Error | null, data: unknown) => void) => {
                            console.log('Authorizing channel:', channel.name, 'socket:', socketId);
                            axios
                                .post(
                                    url,
                                    {
                                        socket_id: socketId,
                                        channel_name: channel.name,
                                    },
                                    {
                                        headers: {
                                            Authorization: `Bearer ${token}`,
                                        },
                                    },
                                )
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
                key: import.meta.env.VITE_REVERB_APP_KEY || 'your-reverb-key',
                wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
                wsPort: Number(import.meta.env.VITE_REVERB_PORT) || 8080,
                wssPort: Number(import.meta.env.VITE_REVERB_PORT) || 8080,
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

        channel.error((error: Error) => {
            console.error('Notification channel error:', error);
            onError?.(error);
        });

        return () => {
            if (window.Echo) {
                window.Echo.leave('notifications');
            }
        };
    }, [onNotification, onError, user]);

    return {
        echo: window.Echo,
    };
};
