import { useQuery } from '@tanstack/react-query';
import { contributionApi } from '../../api/contribution';

const useContributionDetailQuery = (id: number) => {
    return useQuery({
        queryKey: ['contributionDetail', id],
        queryFn: () => contributionApi.show(id),
        enabled: id > 0,
    });
};

export default useContributionDetailQuery;
