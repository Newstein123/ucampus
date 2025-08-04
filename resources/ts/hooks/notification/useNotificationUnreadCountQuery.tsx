import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '../../api/notification';

const useNotificationUnreadCountQuery = () => {
    return useQuery({
        queryKey: ['notificationUnreadCount'],
        queryFn: () => notificationApi.getUnreadCount(),
        refetchInterval: 30000, // Refetch every 30 seconds
    });
};

export default useNotificationUnreadCountQuery;
