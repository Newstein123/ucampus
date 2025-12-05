import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contributionApi } from '../../api/contribution';

interface BookmarkMutationOptions {
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
}

const useContributionBookmarkMutation = (options?: BookmarkMutationOptions) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (contributionId: number) => contributionApi.bookmark(contributionId),
        onSuccess: (data, contributionId) => {
            console.log('🔖 Bookmark toggled:', data);

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
                            ? { ...contribution, is_bookmarked: data.data.is_bookmarked }
                            : contribution
                    )
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
                                ? { ...contribution, is_bookmarked: data.data.is_bookmarked }
                                : contribution
                        )
                    }))
                };
            });

            // Invalidate bookmarks list
            queryClient.invalidateQueries({ queryKey: ['bookmarks'] });

            options?.onSuccess?.(data);
        },
        onError: (error) => {
            console.error('🔖 Bookmark mutation error:', error);
            options?.onError?.(error);
        },
    });
};

export default useContributionBookmarkMutation;
