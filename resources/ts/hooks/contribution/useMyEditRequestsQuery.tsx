import { useQuery } from '@tanstack/react-query';

import { contributionApi } from '../../api/contribution';
import { EditRequestListResponse } from '../../types/contribution';

export const useMyEditRequestsQuery = (status?: string) => {
    return useQuery<EditRequestListResponse>({
        queryKey: ['myEditRequests', status],
        queryFn: () => contributionApi.getMyEditRequests(status),
    });
};
