import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../../api/notification';
import { NotificationReadRequest } from '../../types/notification';

const useNotificationReadMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: NotificationReadRequest) => notificationApi.read(data),
        onSuccess: () => {
            // Invalidate and refetch notification list and unread count
            queryClient.invalidateQueries({ queryKey: ['notificationList'] });
            queryClient.invalidateQueries({ queryKey: ['notificationUnreadCount'] });
        },
    });
};

export default useNotificationReadMutation;
