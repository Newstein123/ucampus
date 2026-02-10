import { QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ErrorResponse } from '..';
import { contributionApi } from '../../api/contribution';
import { Contribution, ContributionResponse } from '../../types/contribution';

interface BookmarkResponse {
    success: boolean;
    message: string;
    data: { is_bookmarked: boolean; message: string };
}

interface ContributionListResponse {
    data: Contribution[];
}

interface ContributionListInfiniteResponse {
    pages: Array<ContributionResponse>;
}

interface BookmarkMutationOptions {
    onSuccess?: (data: BookmarkResponse) => void;
    onError?: (error: AxiosError<ErrorResponse> | Error) => void;
}

interface RollbackContext {
    previousContributionList: Array<[QueryKey, unknown]>;
    previousDetail: Array<[QueryKey, unknown]>;
    previousTrending: unknown;
}

/**
 * Hook to toggle bookmark state for a contribution.
 * Uses optimistic updates so the UI changes instantly.
 */
const useContributionBookmarkMutation = (options?: BookmarkMutationOptions) => {
    const queryClient = useQueryClient();

    return useMutation<BookmarkResponse, AxiosError<ErrorResponse> | Error, number, RollbackContext>({
        mutationFn: (contributionId: number) => contributionApi.bookmark(contributionId),

        // Optimistic update before the API call
        onMutate: async (contributionId: number) => {
            // Cancel any outgoing refetches for all relevant queries
            await queryClient.cancelQueries({ queryKey: ['contributionList'] });
            await queryClient.cancelQueries({ queryKey: ['contributionDetail'] });
            await queryClient.cancelQueries({ queryKey: ['contributionTrending'] });

            // Snapshot previous data for rollback (getQueriesData returns array of [queryKey, data] tuples)
            const previousContributionList = queryClient.getQueriesData({ queryKey: ['contributionList'] });
            const previousDetail = queryClient.getQueriesData({ queryKey: ['contributionDetail'] });
            const previousTrending = queryClient.getQueryData(['contributionTrending']);

            // Optimistically toggle is_bookmarked in all matching list queries
            // This handles both regular and infinite queries with ['contributionList', ...] prefix
            queryClient.setQueriesData({ queryKey: ['contributionList'] }, (oldData: unknown) => {
                if (!oldData) return oldData;

                // Check if it's an infinite query (has pages array)
                const infiniteData = oldData as ContributionListInfiniteResponse;
                if (infiniteData?.pages) {
                    return {
                        ...infiniteData,
                        pages: infiniteData.pages.map((page: ContributionResponse) => ({
                            ...page,
                            data: page.data.map((contribution: Contribution) =>
                                contribution.id === contributionId ? { ...contribution, is_bookmarked: !contribution.is_bookmarked } : contribution,
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
                            contribution.id === contributionId ? { ...contribution, is_bookmarked: !contribution.is_bookmarked } : contribution,
                        ),
                    };
                }

                return oldData;
            });

            // Update Detail View - match any contributionDetail query where the data has matching id
            queryClient.setQueriesData({ queryKey: ['contributionDetail'] }, (oldData: { data: Contribution } | undefined) => {
                if (!oldData?.data) return oldData;
                // Only update if this is the contribution we're bookmarking
                if (oldData.data.id !== contributionId) return oldData;
                return {
                    ...oldData,
                    data: {
                        ...oldData.data,
                        is_bookmarked: !oldData.data.is_bookmarked,
                    },
                };
            });

            // Update Trending List
            queryClient.setQueriesData({ queryKey: ['contributionTrending'] }, (oldData: ContributionListResponse | undefined) => {
                if (!oldData?.data) return oldData;
                return {
                    ...oldData,
                    data: oldData.data.map((contribution: Contribution) =>
                        contribution.id === contributionId ? { ...contribution, is_bookmarked: !contribution.is_bookmarked } : contribution,
                    ),
                };
            });

            // Return context for possible rollback on error
            return { previousContributionList, previousDetail, previousTrending };
        },

        // After server response, ensure cache reflects actual state
        onSuccess: (data) => {
            // Invalidate contribution lists to ensure fresh data
            queryClient.invalidateQueries({ queryKey: ['contributionList'] });
            queryClient.invalidateQueries({ queryKey: ['contributionDetail'] });
            queryClient.invalidateQueries({ queryKey: ['contributionTrending'] });

            // Invalidate the bookmarks list so the Bookmarks page refreshes
            queryClient.invalidateQueries({ queryKey: ['bookmarks'] });

            options?.onSuccess?.(data);
        },

        // Roll back optimistic update if the request fails
        onError: (error, contributionId, context) => {
            if (context?.previousContributionList) {
                context.previousContributionList.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            if (context?.previousDetail) {
                context.previousDetail.forEach(([queryKey, data]: [QueryKey, unknown]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            if (context?.previousTrending) {
                queryClient.setQueriesData({ queryKey: ['contributionTrending'] }, context.previousTrending);
            }
            options?.onError?.(error);
        },
    });
};

export default useContributionBookmarkMutation;
export { useContributionBookmarkMutation };
