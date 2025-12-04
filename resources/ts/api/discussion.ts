import {
    CreateDiscussionRequest,
    CreateDiscussionResponse,
    DeleteDiscussionRequest,
    DeleteDiscussionResponse,
    DiscussionListRequest,
    DiscussionListResponse,
    DiscussionResponsesRequest,
    DiscussionResponsesResponse,
    InterestUpdateRequest,
    InterestUpdateResponse,
    UpdateDiscussionRequest,
    UpdateDiscussionResponse,
} from '../types/discussion';
import { apiClient } from './client';
import { endpoints } from './endpoints';

export const discussionApi = {
    // Get all parent discussions for a contribution
    async list(data: DiscussionListRequest): Promise<DiscussionListResponse> {
        const response = await apiClient.getClient().get<DiscussionListResponse>(endpoints.discussion_list, {
            params: data,
        });
        return response.data;
    },

    // Get all responses for a specific discussion
    async getResponses(data: DiscussionResponsesRequest): Promise<DiscussionResponsesResponse> {
        const response = await apiClient
            .getClient()
            .get<DiscussionResponsesResponse>(endpoints.discussion_responses.replace('{id}', data.discussion_id.toString()));
        return response.data;
    },

    // Create a new discussion (parent or reply)
    async create(data: CreateDiscussionRequest): Promise<CreateDiscussionResponse> {
        const response = await apiClient.getClient().post<CreateDiscussionResponse>(endpoints.discussion_create, data);
        return response.data;
    },

    // Update an existing discussion
    async update(data: UpdateDiscussionRequest): Promise<UpdateDiscussionResponse> {
        const response = await apiClient
            .getClient()
            .put<UpdateDiscussionResponse>(endpoints.discussion_update.replace('{id}', data.discussion_id.toString()), { content: data.content });
        return response.data;
    },

    // Delete a discussion
    async delete(data: DeleteDiscussionRequest): Promise<DeleteDiscussionResponse> {
        const response = await apiClient
            .getClient()
            .delete<DeleteDiscussionResponse>(endpoints.discussion_delete.replace('{id}', data.discussion_id.toString()));
        return response.data;
    },

    // Update interest (like/unlike) for a discussion
    async updateInterest(data: InterestUpdateRequest): Promise<InterestUpdateResponse> {
        const response = await apiClient
            .getClient()
            .post<InterestUpdateResponse>(endpoints.discussion_interest.replace('{id}', data.discussion_id.toString()));
        return response.data;
    },
};
