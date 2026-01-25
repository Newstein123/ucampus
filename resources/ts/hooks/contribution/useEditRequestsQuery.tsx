import { useQuery } from '@tanstack/react-query';

import { contributionApi } from '../../api/contribution';
import { EditRequestListResponse } from '../../types/contribution';

export const useEditRequestsQuery = (contributionId: number, status?: string, contentKey?: string) => {
    return useQuery<EditRequestListResponse>({
        queryKey: ['editRequests', contributionId, status, contentKey],
        queryFn: () => contributionApi.listEditRequests(contributionId, status, contentKey),
        enabled: !!contributionId,
    });
};
