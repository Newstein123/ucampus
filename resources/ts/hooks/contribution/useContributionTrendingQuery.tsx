import { useQuery } from '@tanstack/react-query';
import { contributionApi } from '../../api/contribution';
import { ContributionTrendingRequest } from '../../types/contribution';

const useContributionTrendingQuery = (data: ContributionTrendingRequest) => {
    return useQuery({
        queryKey: ['contributionTrending', data.type, data.page, data.per_page],
        queryFn: () => contributionApi.trending(data),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    });
};

export default useContributionTrendingQuery;
