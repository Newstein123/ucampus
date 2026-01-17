import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ErrorResponse } from '..';
import { contributionApi } from '../../api/contribution';
import { ContributionNotesResponse } from '../../types/contribution';

export const useNotesQuery = (contributionId: number, perPage = 10, page = 1, contentKey?: string) => {
    return useQuery<ContributionNotesResponse, AxiosError<ErrorResponse>>({
        queryKey: ['contributionNotes', contributionId, perPage, page, contentKey],
        queryFn: () => contributionApi.getNotes(contributionId, perPage, page, contentKey),
        enabled: contributionId > 0,
    });
};
