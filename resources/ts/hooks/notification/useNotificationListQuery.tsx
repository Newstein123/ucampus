import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '../../api/notification';
import { NotificationListRequest } from '../../types/notification';

const useNotificationListQuery = (data: NotificationListRequest) => {
    return useQuery({
        queryKey: ['notificationList', data],
        queryFn: () => notificationApi.list(data),
    });
};

export default useNotificationListQuery;
