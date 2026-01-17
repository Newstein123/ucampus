export interface Attachment {
    id: number | null;
    url: string;
    path: string;
    name: string;
    type: string | null;
    size: number | null;
}

export interface ContributionRole {
    id: number;
    key: string;
    label: string;
}

export interface Participant {
    id: number;
    user_id: number;
    name: string;
    username: string;
    role_id: number | null;
    role: ContributionRole | null;
    joined_at: string | null;
    status?: string; // 'pending', 'accepted', 'active', 'rejected', 'left', 'removed'
}

export interface Contribution {
    id: number;
    title: string;
    content: Content;
    type: string;
    tags: string[];
    allow_collab: boolean;
    is_public: boolean;
    status: string;
    views_count: number;
    thumbnail_url: string;
    likes_count: number;
    comments_count: number;
    is_interested: boolean;
    is_bookmarked: boolean;
    attachments: Attachment[];
    participants?: Participant[];
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        name: string;
        username: string;
    };
}

export interface ContributionResponse {
    success: boolean;
    message: string;
    data: Contribution[];
}

export interface ContributionListRequest {
    type?: string;
    per_page?: number;
    page?: number;
    user_id?: number;
}

export interface ContributionTrendingRequest {
    type?: string;
    per_page?: number;
    page?: number;
}

export interface ContributionSearchRequest {
    type?: string;
    q?: string;
    sort?: 'latest' | 'oldest' | 'most_liked' | 'most_viewed' | 'most_commented';
    per_page?: number;
    page?: number;
}

export interface Content {
    title: string;
    description: string | null;
    question: string | null;
    answer: string | null;
    thought: string | null;
    problem: string | null;
    solution: string | null;
    impact: string | null;
    why_it_matters: string | null;
    resources: string | null;
    references: string | null;
}

export interface CreateContributionRequest {
    title: string;
    content: Content;
    is_public: boolean;
    type: string;
    tags: string[];
}

export interface CreateContributionResponse {
    success: boolean;
    message: string;
    data: Contribution;
}

// Edit Request Types
export interface EditRequestChanges {
    content_key: string;
    new_value: string;
    old_value?: string | null;
}

export interface EditRequest {
    id: number;
    contribution_id: number;
    user: {
        id: number;
        name: string;
    };
    changes: EditRequestChanges;
    editor_note: string | null;
    status: 'pending' | 'approved' | 'rejected';
    reviewed_by: number | null;
    reviewer: {
        id: number;
        name: string;
    } | null;
    review_note: string | null;
    applied_at: string | null;
    created_at: string;
    updated_at: string;
    contribution?: {
        id: number;
        title: string;
        type: string;
    };
}

export interface CreateEditRequestRequest {
    changes: EditRequestChanges;
    note?: string | null;
}

export interface CreateEditRequestResponse {
    success: boolean;
    message: string;
    data: EditRequest;
}

export interface EditRequestListResponse {
    success: boolean;
    message: string;
    data: {
        edit_requests: EditRequest[];
    };
}

export interface ApproveEditRequestResponse {
    success: boolean;
    message: string;
    data: {
        id: number;
        status: string;
        applied_at: string;
        reviewed_by: {
            id: number;
            name: string;
        };
    };
}

export interface RejectEditRequestRequest {
    note?: string | null;
}

export interface RejectEditRequestResponse {
    success: boolean;
    message: string;
    data: {
        id: number;
        status: string;
        reviewed_by: {
            id: number;
            name: string;
        };
        review_note: string | null;
    };
}

// Contribution Note Types
export type NoteType = 'idea' | 'concern' | 'improvement';

export interface ContributionNote {
    id: number;
    contribution_id: number;
    user: {
        id: number;
        username: string;
        profileName: string;
        avatar: string | null;
    };
    type: NoteType;
    content_key: string | null;
    status: 'pending' | 'resolved' | 'rejected';
    note: string;
    resolved_by: number | null;
    resolver: {
        id: number;
        name: string;
    } | null;
    resolved_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface ContributionNotesResponse {
    success: boolean;
    message: string;
    data: ContributionNote[];
}

export interface CreateNoteRequest {
    contribution_id: number;
    type: NoteType;
    content_key?: string | null;
    note: string;
}

export interface CreateNoteResponse {
    success: boolean;
    message: string;
    data: ContributionNote;
}

export interface UpdateNoteRequest {
    type?: NoteType;
    note?: string;
}

export interface UpdateNoteResponse {
    success: boolean;
    message: string;
    data: ContributionNote;
}

export interface ListNotesRequest {
    contribution_id: number;
    per_page?: number;
    page?: number;
}

export interface DeleteNoteResponse {
    success: boolean;
    message: string;
}
