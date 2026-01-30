import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { ErrorResponse } from '..';
import { contributionApi } from '../../api/contribution';
import { ApproveEditRequestResponse } from '../../types/contribution';

export const useApproveEditRequestMutation = () => {
    const queryClient = useQueryClient();

    return useMutation<ApproveEditRequestResponse, AxiosError<ErrorResponse>, number>({
        mutationKey: ['approveEditRequest'],
        mutationFn: (editRequestId) => contributionApi.approveEditRequest(editRequestId),
        onSuccess: () => {
            // Invalidate all edit request queries to refresh lists
            queryClient.invalidateQueries({ queryKey: ['editRequests'] });
            queryClient.invalidateQueries({ queryKey: ['myEditRequests'] });
        },
    });
};
