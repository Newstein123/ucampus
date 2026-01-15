import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contributionApi } from '../../api/contribution';
import { Contribution } from '../../types/contribution';

interface InterestResponse {
    success: boolean;
    message: string;
    data: { is_interested: boolean };
}

interface ContributionListResponse {
    data: Contribution[];
}

interface ContributionListInfiniteResponse {
    pages: Array<{ data: Contribution[] }>;
}

interface UseContributionInterestMutationProps {
    onSuccess?: (data: InterestResponse) => void;
    onError?: (error: Error | unknown) => void;
}

const useContributionInterestMutation = ({ onSuccess, onError }: UseContributionInterestMutationProps = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (contributionId: number) => contributionApi.interest(contributionId),

        onMutate: async (contributionId: number) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['contributionList'] });
            await queryClient.cancelQueries({ queryKey: ['contributionListInfinite'] });
            await queryClient.cancelQueries({ queryKey: ['contributionDetail', contributionId] });
            await queryClient.cancelQueries({ queryKey: ['contributionTrending'] });

            // Snapshot the previous value
            const previousList = queryClient.getQueryData(['contributionList']);
            const previousInfiniteList = queryClient.getQueriesData({ queryKey: ['contributionListInfinite'] });
            const previousDetail = queryClient.getQueryData(['contributionDetail', contributionId]);
            const previousTrending = queryClient.getQueryData(['contributionTrending']);

            // Optimistically update to the new value
            // 1. Update List
            queryClient.setQueriesData({ queryKey: ['contributionList'] }, (oldData: ContributionListResponse | undefined) => {
                if (!oldData?.data) return oldData;
                return {
                    ...oldData,
                    data: oldData.data.map((contribution: Contribution) =>
                        contribution.id === contributionId
                            ? {
                                  ...contribution,
                                  is_interested: !contribution.is_interested,
                                  likes_count: !contribution.is_interested ? contribution.likes_count + 1 : Math.max(0, contribution.likes_count - 1),
                              }
                            : contribution,
                    ),
                };
            });

            // 2. Update Infinite List
            queryClient.setQueriesData({ queryKey: ['contributionListInfinite'] }, (oldData: ContributionListInfiniteResponse | undefined) => {
                if (!oldData?.pages) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page: { data: Contribution[] }) => ({
                        ...page,
                        data: page.data.map((contribution: Contribution) =>
                            contribution.id === contributionId
                                ? {
                                      ...contribution,
                                      is_interested: !contribution.is_interested,
                                      likes_count: !contribution.is_interested
                                          ? contribution.likes_count + 1
                                          : Math.max(0, contribution.likes_count - 1),
                                  }
                                : contribution,
                        ),
                    })),
                };
            });

            // 3. Update Detail View
            queryClient.setQueryData(['contributionDetail', contributionId], (oldData: { data: Contribution } | undefined) => {
                if (!oldData?.data) return oldData;
                return {
                    ...oldData,
                    data: {
                        ...oldData.data,
                        is_interested: !oldData.data.is_interested,
                        likes_count: !oldData.data.is_interested ? oldData.data.likes_count + 1 : Math.max(0, oldData.data.likes_count - 1),
                    },
                };
            });

            // 4. Update Trending List
            queryClient.setQueriesData({ queryKey: ['contributionTrending'] }, (oldData: ContributionListResponse | undefined) => {
                if (!oldData?.data) return oldData;
                return {
                    ...oldData,
                    data: oldData.data.map((contribution: Contribution) =>
                        contribution.id === contributionId
                            ? {
                                  ...contribution,
                                  is_interested: !contribution.is_interested,
                                  likes_count: !contribution.is_interested ? contribution.likes_count + 1 : Math.max(0, contribution.likes_count - 1),
                              }
                            : contribution,
                    ),
                };
            });

            // Return a context object with the snapshotted value
            return { previousList, previousInfiniteList, previousDetail, previousTrending };
        },

        onError: (err, contributionId, context) => {
            console.error('Interest mutation error:', err);
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousList) {
                queryClient.setQueriesData({ queryKey: ['contributionList'] }, context.previousList);
            }
            if (context?.previousInfiniteList) {
                context.previousInfiniteList.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            if (context?.previousDetail) {
                queryClient.setQueryData(['contributionDetail', contributionId], context.previousDetail);
            }
            if (context?.previousTrending) {
                queryClient.setQueriesData({ queryKey: ['contributionTrending'] }, context.previousTrending);
            }
            onError?.(err);
        },

        onSuccess: (data, contributionId) => {
            // Invalidate to ensure consistency, but the user has already seen the update
            // We can optionally check if the server response matches our optimistic update
            // For now, we just invalidate to be safe, but we could also update with server data if needed.
            // Ideally we shouldn't need to invalidate if our optimistic logic is correct,
            // but invalidating ensures we get the fresh state including any side effects.
            // However, to keep it "instant", we just let the optimistic update stand and maybe invalidate silently?
            // "Nothing else to do" from user requirement implies we might not even need to invalidate if we trust the API.
            // But let's invalidate just to be sure, it happens in background.
            queryClient.invalidateQueries({ queryKey: ['contributionList'] });
            queryClient.invalidateQueries({ queryKey: ['contributionListInfinite'] });
            queryClient.invalidateQueries({ queryKey: ['contributionDetail', contributionId] });
            queryClient.invalidateQueries({ queryKey: ['contributionTrending'] });

            onSuccess?.(data);
        },
    });
};

export default useContributionInterestMutation;
