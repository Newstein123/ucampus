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
    async create(data: CreateContributionRequest | FormData): Promise<CreateContributionResponse> {
        // When FormData is used, axios automatically sets Content-Type to multipart/form-data
        const response = await apiClient.getClient().post<CreateContributionResponse>(endpoints.contribution_create, data);
        return response.data;
    },
    async interest(contributionId: number): Promise<{ success: boolean; message: string; data: { is_interested: boolean } }> {
        const response = await apiClient.getClient().post<{
            success: boolean;
            message: string;
            data: { is_interested: boolean };
        }>(`${endpoints.contribution_interest}/${contributionId}/interest`);
        return response.data;
    },
    async bookmark(contributionId: number): Promise<{ success: boolean; message: string; data: { is_bookmarked: boolean; message: string } }> {
        const response = await apiClient.getClient().post<{
            success: boolean;
            message: string;
            data: { is_bookmarked: boolean; message: string };
        }>(`${endpoints.contribution_bookmark}/${contributionId}/bookmarks`);
        return response.data;
    },
    async getBookmarks(): Promise<ContributionResponse> {
        const response = await apiClient.getClient().get<ContributionResponse>(endpoints.bookmark_list);
        return response.data;
    },
    async uploadAttachment(
        file: File,
    ): Promise<{ success: boolean; message: string; data: { url: string; path: string; name: string; type: string; size: number } }> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.getClient().post<{
            success: boolean;
            message: string;
            data: { url: string; path: string; name: string; type: string; size: number };
        }>(endpoints.contribution_upload_attachment, formData);
        return response.data;
    },
    async requestCollaboration(contributionId: number, reason: string): Promise<{ success: boolean; message: string; data: unknown }> {
        const response = await apiClient.getClient().post<{
            success: boolean;
            message: string;
            data: unknown;
        }>(endpoints.collaboration_request, {
            contribution_id: contributionId,
            reason,
        });
        return response.data;
    },
};
