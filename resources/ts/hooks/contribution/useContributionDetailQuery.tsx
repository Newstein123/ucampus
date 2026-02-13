import { useQuery } from '@tanstack/react-query';
import { contributionApi } from '../../api/contribution';

const useContributionDetailQuery = (slug: string) => {
    return useQuery({
        queryKey: ['contributionDetail', slug],
        queryFn: () => contributionApi.show(slug),
        enabled: !!slug && slug.length > 0,
    });
};

export default useContributionDetailQuery;
