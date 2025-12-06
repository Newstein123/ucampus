import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contributionApi } from '../../api/contribution';

interface BookmarkMutationOptions {
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
}

/**
 * Hook to toggle bookmark state for a contribution.
 * Uses optimistic updates so the UI changes instantly.
 */
const useContributionBookmarkMutation = (options?: BookmarkMutationOptions) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (contributionId: number) => contributionApi.bookmark(contributionId),

        // Optimistic update before the API call
        onMutate: async (contributionId: number) => {
            // Cancel any outgoing refetches for both list queries (match any type)
            await queryClient.cancelQueries({ queryKey: ['contributionList'], exact: false });
            await queryClient.cancelQueries({ queryKey: ['contributionListInfinite'], exact: false });

            // Snapshot previous data for rollback
            const previousData = queryClient.getQueriesData({ queryKey: ['contributionList'] });

            // Optimistically toggle is_bookmarked in all matching list queries (any type param)
            queryClient.setQueriesData({ queryKey: ['contributionList'], exact: false }, (oldData: any) => {
                if (!oldData?.pages) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page: any) => ({
                        ...page,
                        data: page.data.map((contribution: any) =>
                            contribution.id === contributionId
                                ? { ...contribution, is_bookmarked: !contribution.is_bookmarked }
                                : contribution
                        ),
                    })),
                };
            });

            // Same optimistic update for infinite query
            queryClient.setQueriesData({ queryKey: ['contributionListInfinite'], exact: false }, (oldData: any) => {
                if (!oldData?.pages) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page: any) => ({
                        ...page,
                        data: page.data.map((contribution: any) =>
                            contribution.id === contributionId
                                ? { ...contribution, is_bookmarked: !contribution.is_bookmarked }
                                : contribution
                        ),
                    })),
                };
            });

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
            queryClient.setQueriesData({ queryKey: ['contributionList'], exact: false }, (oldData: any) => {
                if (!oldData?.pages) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page: any) => ({
                        ...page,
                        data: page.data.map((contribution: any) =>
                            contribution.id === contributionId
                                ? { ...contribution, is_bookmarked: data.data.is_bookmarked }
                                : contribution
                        ),
                    })),
                };
            });

            queryClient.setQueriesData({ queryKey: ['contributionListInfinite'], exact: false }, (oldData: any) => {
                if (!oldData?.pages) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page: any) => ({
                        ...page,
                        data: page.data.map((contribution: any) =>
                            contribution.id === contributionId
                                ? { ...contribution, is_bookmarked: data.data.is_bookmarked }
                                : contribution
                        ),
                    })),
                };
            });

            // Invalidate the bookmarks list so the Bookmarks page refreshes
            queryClient.invalidateQueries({ queryKey: ['bookmarks'] });

            options?.onSuccess?.(data);
        },

        // Roll back optimistic update if the request fails
        onError: (error, contributionId, context) => {
            console.error('🔖 Bookmark mutation error:', error);
            if (context?.previousData) {
                context.previousData.forEach(([queryKey, data]: [any, any]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            options?.onError?.(error);
        },
    });
};

export default useContributionBookmarkMutation;
