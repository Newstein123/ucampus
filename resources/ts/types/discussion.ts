export interface DiscussionUser {
    username: string;
    profileName: string;
    avatar: string;
}

export interface Discussion {
    id: number;
    user: DiscussionUser;
    content: string;
    contribution_id: number;
    is_edited: boolean;
    interests: number;
    parent_id?: number;
    responses?: Discussion[];
    created_at: string;
    updated_at: string;
}

export interface DiscussionListRequest {
    contribution_id: number;
    per_page?: number;
    page?: number;
}

export interface DiscussionListResponse {
    success: boolean;
    message: string;
    data: {
        discussions: Discussion[];
        contribution_id: number;
        pagination: {
            total: number;
            per_page: number;
            current_page: number;
            last_page: number;
        };
    };
}

export interface DiscussionResponsesRequest {
    discussion_id: number;
}

export interface DiscussionResponsesResponse {
    success: boolean;
    message: string;
    data: {
        responses: Discussion;
    };
}

export interface CreateDiscussionRequest {
    content: string;
    contribution_id: number;
    parent_id?: number;
}

export interface CreateDiscussionResponse {
    success: boolean;
    message: string;
    data: {
        discussions: Discussion;
    };
}

export interface UpdateDiscussionRequest {
    discussion_id: number;
    content: string;
}

export interface UpdateDiscussionResponse {
    success: boolean;
    message: string;
    data: {
        discussion: Discussion;
    };
}

export interface DeleteDiscussionRequest {
    discussion_id: number;
}

export interface DeleteDiscussionResponse {
    success: boolean;
    message: string;
}

export interface InterestUpdateRequest {
    discussion_id: number;
}

export interface InterestUpdateResponse {
    success: boolean;
    message: string;
}
