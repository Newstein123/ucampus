import { useQuery } from '@tanstack/react-query';

import { contributionApi } from '../../api/contribution';
import { EditRequestListResponse } from '../../types/contribution';

export const useEditRequestsQuery = (contributionId: number, status?: string) => {
    return useQuery<EditRequestListResponse>({
        queryKey: ['editRequests', contributionId, status],
        queryFn: () => contributionApi.listEditRequests(contributionId, status),
        enabled: !!contributionId,
    });
};
