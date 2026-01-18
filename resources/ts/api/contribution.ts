import {
    ApproveEditRequestResponse,
    ContributionListRequest,
    ContributionNotesResponse,
    ContributionResponse,
    ContributionSearchRequest,
    ContributionTrendingRequest,
    CreateContributionRequest,
    CreateContributionResponse,
    CreateEditRequestRequest,
    CreateEditRequestResponse,
    CreateNoteRequest,
    CreateNoteResponse,
    DeleteNoteResponse,
    EditRequestListResponse,
    RejectEditRequestRequest,
    RejectEditRequestResponse,
    UpdateNoteRequest,
    UpdateNoteResponse,
} from '../types/contribution';
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
    async update(id: number, data: CreateContributionRequest | FormData): Promise<CreateContributionResponse> {
        const response = await apiClient
            .getClient()
            .post<CreateContributionResponse>(endpoints.contribution_update.replace('{id}', String(id)), data, {
                headers: {
                    'X-HTTP-Method-Override': 'PUT',
                },
            });
        return response.data;
    },
    async delete(id: number): Promise<{ success: boolean; message: string }> {
        const response = await apiClient
            .getClient()
            .delete<{ success: boolean; message: string }>(endpoints.contribution_delete.replace('{id}', String(id)));
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
        }>(`${endpoints.contribution_bookmark}/${contributionId}/bookmarks`, { contribution_id: contributionId });
        return response.data;
    },
    async unbookmark(contributionId: number): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.getClient().delete<{
            success: boolean;
            message: string;
        }>(`${endpoints.contribution_bookmark}/${contributionId}/bookmarks`, {
            data: { contribution_id: contributionId },
        });
        return response.data;
    },
    async getBookmarks(): Promise<ContributionResponse> {
        const response = await apiClient.getClient().get<ContributionResponse>(endpoints.bookmark_list);
        return response.data;
    },
    async uploadAttachment(
        file: File,
        contributionId?: number,
    ): Promise<{ success: boolean; message: string; data: { id: number; url: string; path: string; name: string; type: string; size: number } }> {
        const formData = new FormData();
        formData.append('file', file);
        if (contributionId) {
            formData.append('contribution_id', contributionId.toString());
        }
        const response = await apiClient.getClient().post<{
            success: boolean;
            message: string;
            data: { id: number; url: string; path: string; name: string; type: string; size: number };
        }>(endpoints.contribution_upload_attachment, formData);
        return response.data;
    },
    async deleteAttachment(attachmentId: number): Promise<{ success: boolean; message: string }> {
        const response = await apiClient
            .getClient()
            .delete<{ success: boolean; message: string }>(endpoints.contribution_delete_attachment.replace('{id}', String(attachmentId)));
        return response.data;
    },
    async downloadAttachment(attachmentId: number, filename: string): Promise<void> {
        const response = await apiClient.getClient().post(
            endpoints.contribution_download_attachment.replace('{id}', String(attachmentId)),
            {},
            {
                responseType: 'blob', // Important: tell axios to handle binary data
            },
        );

        // Check if the response is actually an error (Laravel returns JSON errors as blob)
        const contentType = response.headers['content-type'] || '';
        if (contentType.includes('application/json')) {
            const text = await response.data.text();
            const errorData = JSON.parse(text);
            throw new Error(errorData.message || 'Failed to download file');
        }

        // Create a blob from the response
        const blob = new Blob([response.data]);

        // Create object URL
        const blobUrl = window.URL.createObjectURL(blob);

        // Create a temporary anchor element
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;

        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the object URL after a short delay to ensure download starts
        setTimeout(() => {
            window.URL.revokeObjectURL(blobUrl);
        }, 100);
    },
    async requestCollaboration(
        contributionId: number,
        joinReason: string,
        roleId: number,
    ): Promise<{ success: boolean; message: string; data: unknown }> {
        const response = await apiClient.getClient().post<{
            success: boolean;
            message: string;
            data: unknown;
        }>(endpoints.collaboration_request, {
            contribution_id: contributionId,
            join_reason: joinReason,
            role_id: roleId,
        });
        return response.data;
    },
    async getContributionRoles(): Promise<{
        success: boolean;
        message: string;
        data: Array<{ id: number; key: string; label: string; is_active: boolean }>;
    }> {
        const response = await apiClient.getClient().get<{
            success: boolean;
            message: string;
            data: Array<{ id: number; key: string; label: string; is_active: boolean }>;
        }>(endpoints.contribution_roles);
        return response.data;
    },
    async collaborationAction(
        requestId: number,
        status: number,
    ): Promise<{ success: boolean; message: string; data: { status: number; message: string } }> {
        const response = await apiClient.getClient().post<{
            success: boolean;
            message: string;
            data: { status: number; message: string };
        }>(endpoints.collaboration_action, {
            request_id: requestId,
            status,
        });
        return response.data;
    },
    async trending(data: ContributionTrendingRequest): Promise<ContributionResponse> {
        const response = await apiClient.getClient().get<ContributionResponse>(endpoints.contribution_trending, { params: data });
        return response.data;
    },
    async search(data: ContributionSearchRequest): Promise<ContributionResponse> {
        // Build params object, explicitly including type if present
        const params: Record<string, unknown> = {};
        if (data.q) params.q = data.q;
        if (data.type) params.type = data.type;
        if (data.sort) params.sort = data.sort;
        if (data.per_page) params.per_page = data.per_page;
        if (data.page) params.page = data.page;

        const response = await apiClient.getClient().get<ContributionResponse>(endpoints.contribution_search, { params });
        return response.data;
    },
    async leaveProject(
        contributionId: number,
        leftReason?: string,
        leftAction: 'self' | 'owner' | 'system' = 'self',
    ): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.getClient().post<{ success: boolean; message: string }>(endpoints.project_leave, {
            contribution_id: contributionId,
            left_reason: leftReason,
            left_action: leftAction,
        });
        return response.data;
    },
    // Edit Request APIs
    async createEditRequest(contributionId: number, data: CreateEditRequestRequest): Promise<CreateEditRequestResponse> {
        const response = await apiClient
            .getClient()
            .post<CreateEditRequestResponse>(endpoints.edit_request_create.replace('{id}', String(contributionId)), data);
        return response.data;
    },
    async listEditRequests(contributionId: number, status?: string, contentKey?: string): Promise<EditRequestListResponse> {
        const params: { status?: string; content_key?: string } = {};
        if (status) params.status = status;
        if (contentKey) params.content_key = contentKey;
        const response = await apiClient
            .getClient()
            .get<EditRequestListResponse>(endpoints.edit_request_list.replace('{id}', String(contributionId)), {
                params,
            });
        return response.data;
    },
    async approveEditRequest(editRequestId: number): Promise<ApproveEditRequestResponse> {
        const response = await apiClient
            .getClient()
            .post<ApproveEditRequestResponse>(endpoints.edit_request_approve.replace('{id}', String(editRequestId)));
        return response.data;
    },
    async rejectEditRequest(editRequestId: number, data: RejectEditRequestRequest): Promise<RejectEditRequestResponse> {
        const response = await apiClient
            .getClient()
            .post<RejectEditRequestResponse>(endpoints.edit_request_reject.replace('{id}', String(editRequestId)), data);
        return response.data;
    },
    async getMyEditRequests(status?: string): Promise<EditRequestListResponse> {
        const response = await apiClient.getClient().get<EditRequestListResponse>(endpoints.edit_request_my, {
            params: status ? { status } : {},
        });
        return response.data;
    },

    // Contribution Notes API
    async getNotes(contributionId: number, perPage = 10, page = 1, contentKey?: string): Promise<ContributionNotesResponse> {
        const params: { contribution_id: number; per_page: number; page: number; content_key?: string } = {
            contribution_id: contributionId,
            per_page: perPage,
            page,
        };
        if (contentKey) params.content_key = contentKey;
        const response = await apiClient.getClient().get<ContributionNotesResponse>(endpoints.contribution_notes_list, {
            params,
        });
        return response.data;
    },

    async createNote(data: CreateNoteRequest): Promise<CreateNoteResponse> {
        const response = await apiClient.getClient().post<CreateNoteResponse>(endpoints.contribution_notes_create, data);
        return response.data;
    },

    async updateNote(noteId: number, data: UpdateNoteRequest): Promise<UpdateNoteResponse> {
        const response = await apiClient
            .getClient()
            .put<UpdateNoteResponse>(endpoints.contribution_notes_update.replace('{id}', String(noteId)), data);
        return response.data;
    },

    async deleteNote(noteId: number): Promise<DeleteNoteResponse> {
        const response = await apiClient.getClient().delete<DeleteNoteResponse>(endpoints.contribution_notes_delete.replace('{id}', String(noteId)));
        return response.data;
    },

    async resolveNote(noteId: number): Promise<CreateNoteResponse> {
        const response = await apiClient.getClient().post<CreateNoteResponse>(endpoints.contribution_notes_resolve.replace('{id}', String(noteId)));
        return response.data;
    },

    async rejectNote(noteId: number): Promise<CreateNoteResponse> {
        const response = await apiClient.getClient().post<CreateNoteResponse>(endpoints.contribution_notes_reject.replace('{id}', String(noteId)));
        return response.data;
    },
};
