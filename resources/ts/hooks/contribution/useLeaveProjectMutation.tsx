import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { ErrorResponse } from '..';
import { contributionApi } from '../../api/contribution';

interface LeaveProjectRequest {
    contributionId: number;
    leftReason?: string;
    leftAction?: 'self' | 'owner' | 'system';
}

interface LeaveProjectMutationOptions {
    onSuccess?: (data: { success: boolean; message: string }) => void;
    onError?: (error: AxiosError<ErrorResponse>) => void;
}

export const useLeaveProjectMutation = (options?: LeaveProjectMutationOptions) => {
    const queryClient = useQueryClient();

    return useMutation<{ success: boolean; message: string }, AxiosError<ErrorResponse>, LeaveProjectRequest>({
        mutationKey: ['leaveProject'],
        mutationFn: ({ contributionId, leftReason, leftAction = 'self' }) => contributionApi.leaveProject(contributionId, leftReason, leftAction),
        onSuccess: (data, variables) => {
            // Invalidate contribution queries to refetch updated data
            queryClient.invalidateQueries({ queryKey: ['contributionList'], exact: false });
            queryClient.invalidateQueries({ queryKey: ['contributionListInfinite'], exact: false });
            queryClient.invalidateQueries({ queryKey: ['myContributions'], exact: false });
            queryClient.invalidateQueries({ queryKey: ['contributionTrending'], exact: false });
            queryClient.invalidateQueries({ queryKey: ['contributionSearch'], exact: false });
            // Invalidate the specific contribution detail query
            queryClient.invalidateQueries({ queryKey: ['contribution', variables.contributionId] });

            options?.onSuccess?.(data);
        },
        onError: (error) => {
            options?.onError?.(error);
        },
    });
};
