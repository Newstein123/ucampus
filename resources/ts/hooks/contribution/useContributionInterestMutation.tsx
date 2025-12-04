import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contributionApi } from '../../api/contribution';

interface UseContributionInterestMutationProps {
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
}

const useContributionInterestMutation = ({ onSuccess, onError }: UseContributionInterestMutationProps = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (contributionId: number) => contributionApi.interest(contributionId),
        onSuccess: (data, contributionId) => {
            // Invalidate and refetch contribution lists to update the UI
            queryClient.invalidateQueries({ queryKey: ['contributionList'] });
            queryClient.invalidateQueries({ queryKey: ['contributionListInfinite'] });

            // Optimistically update the contribution in cache
            queryClient.setQueriesData({ queryKey: ['contributionList'] }, (oldData: any) => {
                if (!oldData?.data) return oldData;

                return {
                    ...oldData,
                    data: oldData.data.map((contribution: any) =>
                        contribution.id === contributionId
                            ? {
                                  ...contribution,
                                  is_interested: data.data.is_interested,
                                  likes_count: data.data.is_interested ? contribution.likes_count + 1 : Math.max(0, contribution.likes_count - 1),
                              }
                            : contribution,
                    ),
                };
            });

            // Also update infinite query data
            queryClient.setQueriesData({ queryKey: ['contributionListInfinite'] }, (oldData: any) => {
                if (!oldData?.pages) return oldData;

                return {
                    ...oldData,
                    pages: oldData.pages.map((page: any) => ({
                        ...page,
                        data: page.data.map((contribution: any) =>
                            contribution.id === contributionId
                                ? {
                                      ...contribution,
                                      is_interested: data.data.is_interested,
                                      likes_count: data.data.is_interested ? contribution.likes_count + 1 : Math.max(0, contribution.likes_count - 1),
                                  }
                                : contribution,
                        ),
                    })),
                };
            });

            onSuccess?.(data);
        },
        onError: (error) => {
            console.error('Interest mutation error:', error);
            onError?.(error);
        },
    });
};

export default useContributionInterestMutation;
