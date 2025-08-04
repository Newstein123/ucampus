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
};
