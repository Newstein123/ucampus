import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { ErrorResponse } from '..';
import { contributionApi } from '../../api/contribution';
import { CreateContributionRequest, CreateContributionResponse } from '../../types/contribution';

interface UpdateContributionRequest {
    id: number;
    data: CreateContributionRequest | FormData;
}

export const useUpdateContributionMutation = () => {
    const queryClient = useQueryClient();

    return useMutation<CreateContributionResponse, AxiosError<ErrorResponse>, UpdateContributionRequest>({
        mutationKey: ['updateContribution'],
        mutationFn: ({ id, data }) => contributionApi.update(id, data),
        onSuccess: (data, variables) => {
            // Invalidate all contribution list queries to refetch updated data
            queryClient.invalidateQueries({ queryKey: ['contributionList'], exact: false });
            queryClient.invalidateQueries({ queryKey: ['contributionListInfinite'], exact: false });
            queryClient.invalidateQueries({ queryKey: ['myContributions'], exact: false });
            queryClient.invalidateQueries({ queryKey: ['contributionTrending'], exact: false });
            queryClient.invalidateQueries({ queryKey: ['contributionSearch'], exact: false });

            // Invalidate the specific contribution detail query
            queryClient.invalidateQueries({ queryKey: ['contribution', variables.id] });
        },
    });
};
