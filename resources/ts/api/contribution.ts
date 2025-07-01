import { apiClient } from './client';
import { ContributionListRequest, ContributionResponse } from '../types/contribution';
import { endpoints } from './endpoints';

export const contributionApi = {
    async list(data: ContributionListRequest): Promise<ContributionResponse> {
        const response = await apiClient.getClient().get<ContributionResponse>(endpoints.contribution_list, { params: data });
        return response.data;
    },
};