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
            await queryClient.cancelQueries({ queryKey: ['contributionDetail', contributionId] });
            await queryClient.cancelQueries({ queryKey: ['contributionTrending'] });

            // Snapshot the previous values (getQueriesData returns array of [queryKey, data] tuples)
            const previousContributionList = queryClient.getQueriesData({ queryKey: ['contributionList'] });
            const previousDetail = queryClient.getQueryData(['contributionDetail', contributionId]);
            const previousTrending = queryClient.getQueryData(['contributionTrending']);

            // Update List (handles both regular and infinite queries with ['contributionList', ...] prefix)
            // For infinite queries, the data structure is { pages: [...], pageParams: [...] }
            queryClient.setQueriesData({ queryKey: ['contributionList'] }, (oldData: unknown) => {
                if (!oldData) return oldData;

                // Check if it's an infinite query (has pages array)
                const infiniteData = oldData as ContributionListInfiniteResponse;
                if (infiniteData?.pages) {
                    return {
                        ...infiniteData,
                        pages: infiniteData.pages.map((page: { data: Contribution[] }) => ({
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
                }

                // Check if it's a regular query (has data array)
                const regularData = oldData as ContributionListResponse;
                if (regularData?.data) {
                    return {
                        ...regularData,
                        data: regularData.data.map((contribution: Contribution) =>
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
                    };
                }

                return oldData;
            });

            // Update Detail View
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

            // Update Trending List
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
            return { previousContributionList, previousDetail, previousTrending };
        },

        onError: (err, contributionId, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousContributionList) {
                context.previousContributionList.forEach(([queryKey, data]) => {
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
            // Invalidate to ensure consistency in background
            queryClient.invalidateQueries({ queryKey: ['contributionList'] });
            queryClient.invalidateQueries({ queryKey: ['contributionDetail', contributionId] });
            queryClient.invalidateQueries({ queryKey: ['contributionTrending'] });

            onSuccess?.(data);
        },
    });
};

export default useContributionInterestMutation;
