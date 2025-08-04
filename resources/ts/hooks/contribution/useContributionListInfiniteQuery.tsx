import { useInfiniteQuery } from '@tanstack/react-query';
import { contributionApi } from '../../api/contribution';
import { ContributionListRequest } from '../../types/contribution';

interface UseContributionListInfiniteQueryProps {
    type?: string;
    perPage?: number;
}

const useContributionListInfiniteQuery = ({ type, perPage = 10 }: UseContributionListInfiniteQueryProps) => {
    return useInfiniteQuery({
        queryKey: ['contributionList', type],
        queryFn: ({ pageParam = 1 }) => {
            const params: ContributionListRequest = {
                type,
                page: pageParam,
                per_page: perPage,
            };
            return contributionApi.list(params);
        },
        getNextPageParam: (lastPage, allPages) => {
            // If the last page has fewer items than perPage, we've reached the end
            if (lastPage.data.length < perPage) {
                return undefined;
            }
            return allPages.length + 1;
        },
        initialPageParam: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    });
};

export default useContributionListInfiniteQuery;
