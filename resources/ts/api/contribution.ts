import { ContributionListRequest, ContributionResponse, CreateContributionRequest, CreateContributionResponse } from '../types/contribution';
import { apiClient } from './client';
import { endpoints } from './endpoints';

export const contributionApi = {
    async list(data: ContributionListRequest): Promise<ContributionResponse> {
        const response = await apiClient.getClient().get<ContributionResponse>(endpoints.contribution_list, { params: data });
        return response.data;
    },
    async create(data: CreateContributionRequest): Promise<CreateContributionResponse> {
        const response = await apiClient.getClient().post<CreateContributionResponse>(endpoints.contribution_create, data);
        return response.data;
    },
    async interest(contributionId: number): Promise<{ success: boolean; message: string; data: { is_interested: boolean } }> {
        const response = await apiClient.getClient().post<{ success: boolean; message: string; data: { is_interested: boolean } }>(`${endpoints.contribution_interest}/${contributionId}/interest`);
        return response.data;
    },
};
