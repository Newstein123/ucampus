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
    is_interested: boolean;
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
}

export interface Content {
    title: string;
    description: string | null;
    question: string | null;
    answer: string | null;
    problem: string | null;
    solution: string | null;
    impact: string | null;
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
