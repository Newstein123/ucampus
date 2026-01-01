import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { ErrorResponse } from '..';
import { contributionApi } from '../../api/contribution';
import { CreateEditRequestRequest, CreateEditRequestResponse } from '../../types/contribution';

interface CreateEditRequestParams {
    contributionId: number;
    data: CreateEditRequestRequest;
}

export const useCreateEditRequestMutation = () => {
    const queryClient = useQueryClient();

    return useMutation<CreateEditRequestResponse, AxiosError<ErrorResponse>, CreateEditRequestParams>({
        mutationKey: ['createEditRequest'],
        mutationFn: ({ contributionId, data }) => contributionApi.createEditRequest(contributionId, data),
        onSuccess: (_, variables) => {
            // Invalidate edit requests list for this contribution
            queryClient.invalidateQueries({ queryKey: ['editRequests', variables.contributionId] });
            queryClient.invalidateQueries({ queryKey: ['myEditRequests'] });
            // Also invalidate contribution detail to refresh if edit requests are shown there
            queryClient.invalidateQueries({ queryKey: ['contribution', variables.contributionId] });
        },
    });
};
