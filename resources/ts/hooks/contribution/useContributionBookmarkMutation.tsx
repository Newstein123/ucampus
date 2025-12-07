import { useMutation, useQueryClient } from '@tanstack/react-query';
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
    previousData: Array<[unknown, unknown]>;
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
            // Cancel any outgoing refetches for both list queries
            await queryClient.cancelQueries({ queryKey: ['contributionList'], exact: false });
            await queryClient.cancelQueries({ queryKey: ['contributionListInfinite'], exact: false });

            // Snapshot previous data for rollback
            const previousData = queryClient.getQueriesData({ queryKey: ['contributionList'] });

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

            // Return context for possible rollback on error
            return { previousData };
        },

        // After server response, ensure cache reflects actual state
        onSuccess: (data, contributionId) => {
            console.log('🔖 Bookmark toggled:', data);

            // Invalidate contribution lists to ensure fresh data
            queryClient.invalidateQueries({ queryKey: ['contributionList'], exact: false });
            queryClient.invalidateQueries({ queryKey: ['contributionListInfinite'], exact: false });

            // Update both list caches with the definitive server value
            queryClient.setQueriesData({ queryKey: ['contributionList'], exact: false }, (oldData: ContributionListResponse | undefined) => {
                if (!oldData?.data) return oldData;
                return {
                    ...oldData,
                    data: oldData.data.map((contribution: Contribution) =>
                        contribution.id === contributionId ? { ...contribution, is_bookmarked: data.data.is_bookmarked } : contribution,
                    ),
                };
            });

            queryClient.setQueriesData(
                { queryKey: ['contributionListInfinite'], exact: false },
                (oldData: ContributionListInfiniteResponse | undefined) => {
                    if (!oldData?.pages) return oldData;
                    return {
                        ...oldData,
                        pages: oldData.pages.map((page: ContributionResponse) => ({
                            ...page,
                            data: page.data.map((contribution: Contribution) =>
                                contribution.id === contributionId ? { ...contribution, is_bookmarked: data.data.is_bookmarked } : contribution,
                            ),
                        })),
                    };
                },
            );

            // Invalidate the bookmarks list so the Bookmarks page refreshes
            queryClient.invalidateQueries({ queryKey: ['bookmarks'] });

            options?.onSuccess?.(data);
        },

        // Roll back optimistic update if the request fails
        onError: (error, contributionId, context) => {
            console.error('🔖 Bookmark mutation error:', error);
            if (context?.previousData) {
                context.previousData.forEach(([queryKey, data]: [unknown, unknown]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            options?.onError?.(error);
        },
    });
};

export default useContributionBookmarkMutation;
