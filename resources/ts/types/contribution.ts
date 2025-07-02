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
  description: string;
  question: string;
  answer: string;
  problem: string;
  solution: string;
  impact: string;
  resources: string;
  references: string;
}