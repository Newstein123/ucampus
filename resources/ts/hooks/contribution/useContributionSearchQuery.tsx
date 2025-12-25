import { useQuery } from '@tanstack/react-query';
import { contributionApi } from '../../api/contribution';
import { ContributionSearchRequest } from '../../types/contribution';

const useContributionSearchQuery = (data: ContributionSearchRequest) => {
    return useQuery({
        queryKey: ['contributionSearch', data.q, data.type, data.sort, data.page, data.per_page],
        queryFn: () => contributionApi.search(data),
        enabled: !!data.q || !!data.type, // Only run query if there's a search term or type filter
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchOnWindowFocus: false,
    });
};

export default useContributionSearchQuery;
