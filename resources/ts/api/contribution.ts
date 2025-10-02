import { ContributionListRequest, ContributionResponse, CreateContributionRequest, CreateContributionResponse } from '../types/contribution';
import { apiClient } from './client';
import { endpoints } from './endpoints';

export const contributionApi = {
    async list(data: ContributionListRequest): Promise<ContributionResponse> {
        const response = await apiClient.getClient().get<ContributionResponse>(endpoints.contribution_list, { params: data });
        return response.data;
    },
    async listCollaborations(userId?: number) {
        const response = await apiClient.getClient().get(`${endpoints.collaboration_list}`, {
            params: { user_id: userId },
        });
        return response.data;
    },
    async show(id: number): Promise<CreateContributionResponse> {
        const response = await apiClient.getClient().get<CreateContributionResponse>(endpoints.contribution_show.replace('{id}', String(id)));
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
