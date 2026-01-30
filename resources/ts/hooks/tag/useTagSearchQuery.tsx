import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { tagApi, TagSearchResponse } from '../../api/tag';
import { ErrorResponse } from '../index';

export const useTagSearchQuery = (query: string, limit?: number, enabled: boolean = true) => {
    return useQuery<TagSearchResponse, AxiosError<ErrorResponse>>({
        queryKey: ['tagSearch', query, limit],
        queryFn: () => tagApi.search(query, limit),
        enabled: enabled && query.trim().length > 0,
    });
};
