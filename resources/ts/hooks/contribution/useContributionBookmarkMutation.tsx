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
    previousList: Array<[QueryKey, unknown]>;
    previousInfiniteList: Array<[QueryKey, unknown]>;
    previousDetail: unknown;
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
            await queryClient.cancelQueries({ queryKey: ['contributionList'], exact: false });
            await queryClient.cancelQueries({ queryKey: ['contributionListInfinite'], exact: false });
            await queryClient.cancelQueries({ queryKey: ['contributionDetail', contributionId] });
            await queryClient.cancelQueries({ queryKey: ['contributionTrending'] });

            // Snapshot previous data for rollback
            const previousList = queryClient.getQueriesData({ queryKey: ['contributionList'] });
            const previousInfiniteList = queryClient.getQueriesData({ queryKey: ['contributionListInfinite'] });
            const previousDetail = queryClient.getQueryData(['contributionDetail', contributionId]);
            const previousTrending = queryClient.getQueryData(['contributionTrending']);

            // Optimistically toggle is_bookmarked in all matching list queries
            queryClient.setQueriesData({ queryKey: ['contributionList'], exact: false }, (oldData: ContributionListResponse | undefined) => {
                if (!oldData?.data) return oldData;
                return {
                    ...oldData,
                    data: oldData.data.map((contribution: Contribution) =>
                        contribution.id === contributionId ? { ...contribution, is_bookmarked: !contribution.is_bookmarked } : contribution,
                    ),
                };
            });

            // Same optimistic update for infinite query
            queryClient.setQueriesData(
                { queryKey: ['contributionListInfinite'], exact: false },
                (oldData: ContributionListInfiniteResponse | undefined) => {
                    if (!oldData?.pages) return oldData;
                    return {
                        ...oldData,
                        pages: oldData.pages.map((page: ContributionResponse) => ({
                            ...page,
                            data: page.data.map((contribution: Contribution) =>
                                contribution.id === contributionId ? { ...contribution, is_bookmarked: !contribution.is_bookmarked } : contribution,
                            ),
                        })),
                    };
                },
            );

            // Update Detail View
            queryClient.setQueryData(['contributionDetail', contributionId], (oldData: { data: Contribution } | undefined) => {
                if (!oldData?.data) return oldData;
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
            return { previousList, previousInfiniteList, previousDetail, previousTrending };
        },

        // After server response, ensure cache reflects actual state
        onSuccess: (data, contributionId) => {
            console.log('🔖 Bookmark toggled:', data);

            // Invalidate contribution lists to ensure fresh data
            queryClient.invalidateQueries({ queryKey: ['contributionList'], exact: false });
            queryClient.invalidateQueries({ queryKey: ['contributionListInfinite'], exact: false });
            queryClient.invalidateQueries({ queryKey: ['contributionDetail', contributionId] });
            queryClient.invalidateQueries({ queryKey: ['contributionTrending'] });

            // Invalidate the bookmarks list so the Bookmarks page refreshes
            queryClient.invalidateQueries({ queryKey: ['bookmarks'] });

            // We can also set queries data here if we want to be exactly precise with server response
            // but invalidating is usually safer to get side-effects.
            // However, to keep smooth experience, we can rely on optimistic update already done.
            // The invalidation will trigger background refetch.

            options?.onSuccess?.(data);
        },

        // Roll back optimistic update if the request fails
        onError: (error, contributionId, context) => {
            console.error('🔖 Bookmark mutation error:', error);
            if (context?.previousList) {
                context.previousList.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
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
            options?.onError?.(error);
        },
    });
};

export default useContributionBookmarkMutation;
export { useContributionBookmarkMutation };
