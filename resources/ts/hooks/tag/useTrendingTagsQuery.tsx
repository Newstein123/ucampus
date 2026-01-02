import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { tagApi, TagTrendingResponse } from '../../api/tag';
import { ErrorResponse } from '../index';

export const useTrendingTagsQuery = (limit?: number) => {
    return useQuery<TagTrendingResponse, AxiosError<ErrorResponse>>({
        queryKey: ['trendingTags', limit],
        queryFn: () => tagApi.getTrending(limit),
    });
};
