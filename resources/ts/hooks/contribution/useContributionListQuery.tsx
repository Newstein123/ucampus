import { useQuery } from '@tanstack/react-query';
import { contributionApi } from '../../api/contribution';
import { ContributionListRequest } from '../../types/contribution';

const useContributionListQuery = (data: ContributionListRequest) => {
    return useQuery({
        queryKey: ['contributionList'],
        queryFn: () => contributionApi.list(data),
    });
};

export default useContributionListQuery;
