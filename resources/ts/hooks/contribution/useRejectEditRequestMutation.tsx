import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { ErrorResponse } from '..';
import { contributionApi } from '../../api/contribution';
import { RejectEditRequestRequest, RejectEditRequestResponse } from '../../types/contribution';

interface RejectEditRequestParams {
    editRequestId: number;
    data: RejectEditRequestRequest;
}

export const useRejectEditRequestMutation = () => {
    const queryClient = useQueryClient();

    return useMutation<RejectEditRequestResponse, AxiosError<ErrorResponse>, RejectEditRequestParams>({
        mutationKey: ['rejectEditRequest'],
        mutationFn: ({ editRequestId, data }) => contributionApi.rejectEditRequest(editRequestId, data),
        onSuccess: () => {
            // Invalidate all edit request queries to refresh lists
            queryClient.invalidateQueries({ queryKey: ['editRequests'] });
            queryClient.invalidateQueries({ queryKey: ['myEditRequests'] });
        },
    });
};
