import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { ErrorResponse } from '..';
import { contributionApi } from '../../api/contribution';

export const useDeleteAttachmentMutation = () => {
    const queryClient = useQueryClient();

    return useMutation<{ success: boolean; message: string }, AxiosError<ErrorResponse>, number>({
        mutationKey: ['deleteAttachment'],
        mutationFn: (attachmentId: number) => contributionApi.deleteAttachment(attachmentId),
        onSuccess: () => {
            // Invalidate contribution queries that might include attachments
            queryClient.invalidateQueries({ queryKey: ['contributionList'], exact: false });
            queryClient.invalidateQueries({ queryKey: ['contributionListInfinite'], exact: false });
            queryClient.invalidateQueries({ queryKey: ['myContributions'], exact: false });
            queryClient.invalidateQueries({ queryKey: ['contributionTrending'], exact: false });
            queryClient.invalidateQueries({ queryKey: ['contributionSearch'], exact: false });
            // Invalidate all contribution detail queries
            queryClient.invalidateQueries({ queryKey: ['contribution'], exact: false });
        },
    });
};
