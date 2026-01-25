import { apiClient } from './client';
import { endpoints } from './endpoints';

export interface Tag {
    id: number;
    name: string;
    contributions_count: number;
}

export interface TagTrendingResponse {
    success: boolean;
    message: string;
    data: Tag[];
}

export interface TagSearchResponse {
    success: boolean;
    message: string;
    data: Tag[];
}

export const tagApi = {
    async getTrending(limit?: number): Promise<TagTrendingResponse> {
        const response = await apiClient.getClient().get<TagTrendingResponse>(endpoints.tag_trending, {
            params: { limit },
        });
        return response.data;
    },

    async search(query: string, limit?: number): Promise<TagSearchResponse> {
        const response = await apiClient.getClient().get<TagSearchResponse>(endpoints.tag_search, {
            params: { q: query, limit },
        });
        return response.data;
    },
};
