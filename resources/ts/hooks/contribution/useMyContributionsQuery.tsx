import { useQuery } from '@tanstack/react-query';
import { contributionApi } from '../../api/contribution';
import { ContributionListRequest } from '../../types/contribution';

interface UseMyContributionsQueryOptions {
    type?: 'idea' | 'question' | 'project';
    userId: number;
    perPage?: number;
    page?: number;
    enabled?: boolean;
}

const useMyContributionsQuery = ({ type, userId, perPage = 10, page = 1, enabled = true }: UseMyContributionsQueryOptions) => {
    const request: ContributionListRequest = {
        type,
        user_id: userId,
        per_page: perPage,
        page,
    };

    return useQuery({
        queryKey: ['myContributions', type, userId, perPage, page],
        queryFn: () => contributionApi.list(request),
        enabled: enabled && !!userId,
    });
};

export default useMyContributionsQuery;
