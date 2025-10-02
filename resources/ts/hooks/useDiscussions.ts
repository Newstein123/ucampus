import { useState, useEffect, useCallback } from 'react';
import { discussionApi } from '../api/discussion';
import { 
    Discussion, 
    DiscussionListRequest, 
    CreateDiscussionRequest, 
    UpdateDiscussionRequest,
    DeleteDiscussionRequest,
    InterestUpdateRequest
} from '../types/discussion';

interface UseDiscussionsOptions {
    contributionId: number;
    perPage?: number;
    page?: number;
}

interface UseDiscussionsReturn {
    discussions: Discussion[];
    loading: boolean;
    error: string | null;
    pagination: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    } | null;
    createDiscussion: (data: Omit<CreateDiscussionRequest, 'contribution_id'>) => Promise<void>;
    updateDiscussion: (data: UpdateDiscussionRequest) => Promise<void>;
    deleteDiscussion: (data: DeleteDiscussionRequest) => Promise<void>;
    updateInterest: (data: InterestUpdateRequest) => Promise<void>;
    refreshDiscussions: () => Promise<void>;
}

export const useDiscussions = (options: UseDiscussionsOptions): UseDiscussionsReturn => {
    const { contributionId, perPage = 10, page = 1 } = options;
    
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<{
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    } | null>(null);

    const fetchDiscussions = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await discussionApi.list({
                contribution_id: contributionId,
                per_page: perPage,
                page: page
            });
            
            setDiscussions(response.data.discussions);
            setPagination(response.data.pagination);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch discussions');
        } finally {
            setLoading(false);
        }
    }, [contributionId, perPage, page]);

    const createDiscussion = useCallback(async (data: Omit<CreateDiscussionRequest, 'contribution_id'>) => {
        try {
            const response = await discussionApi.create({
                ...data,
                contribution_id: contributionId
            });
            
            // Add the new discussion to the list
            setDiscussions(prev => [response.data.discussions, ...prev]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create discussion');
            throw err;
        }
    }, [contributionId]);

    const updateDiscussion = useCallback(async (data: UpdateDiscussionRequest) => {
        try {
            const response = await discussionApi.update(data);
            
            // Update the discussion in the list
            setDiscussions(prev => 
                prev.map(discussion => 
                    discussion.id === data.discussion_id 
                        ? response.data.discussion 
                        : discussion
                )
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update discussion');
            throw err;
        }
    }, []);

    const deleteDiscussion = useCallback(async (data: DeleteDiscussionRequest) => {
        try {
            await discussionApi.delete(data);
            
            // Remove the discussion from the list
            setDiscussions(prev => 
                prev.filter(discussion => discussion.id !== data.discussion_id)
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete discussion');
            throw err;
        }
    }, []);

    const updateInterest = useCallback(async (data: InterestUpdateRequest) => {
        try {
            await discussionApi.updateInterest(data);
            
            // Update the interests count in the discussion
            setDiscussions(prev => 
                prev.map(discussion => 
                    discussion.id === data.discussion_id 
                        ? { ...discussion, interests: discussion.interests + 1 }
                        : discussion
                )
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update interest');
            throw err;
        }
    }, []);

    const refreshDiscussions = useCallback(async () => {
        await fetchDiscussions();
    }, [fetchDiscussions]);

    useEffect(() => {
        fetchDiscussions();
    }, [fetchDiscussions]);

    return {
        discussions,
        loading,
        error,
        pagination,
        createDiscussion,
        updateDiscussion,
        deleteDiscussion,
        updateInterest,
        refreshDiscussions
    };
};

