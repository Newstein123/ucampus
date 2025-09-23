import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import {
    Avatar,
    Box,
    IconButton,
    TextField,
    Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import SinglePageLayout from '../../components/SinglePageLayout';
import { useDiscussions } from '../../hooks/useDiscussions';
import { Discussion } from '../../types/discussion';

// Helper function to format time ago
const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
};

const Thread: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const [newPost, setNewPost] = useState('');

    // Use the discussions hook
    const {
        discussions,
        loading,
        error,
        createDiscussion,
        updateInterest
    } = useDiscussions({
        contributionId: parseInt(id || '1'),
        perPage: 20,
        page: 1
    });

    const handleLikePost = async (postId: number) => {
        try {
            await updateInterest({ discussion_id: postId });
        } catch (err) {
            console.error('Failed to update interest:', err);
        }
    };

    const handlePostComment = async () => {
        if (newPost.trim()) {
            try {
                await createDiscussion({
                    content: newPost.trim(),
                });
                setNewPost('');
            } catch (err) {
                console.error('Failed to create discussion:', err);
            }
        }
    };

    return (
        <SinglePageLayout
            title={t('Thread')}
            rightElement={<Typography sx={{ fontWeight: 600, fontSize: 14, color: '#666' }}>Adom Shafi</Typography>}
        >

            {/* Thread Posts */}
            <Box sx={{ p: 2, pb: 0 }}>
                {loading ? (
                    <Typography sx={{ textAlign: 'center', color: '#666', py: 2 }}>
                        Loading discussions...
                    </Typography>
                ) : error ? (
                    <Typography sx={{ textAlign: 'center', color: 'error.main', py: 2 }}>
                        Error: {error}
                    </Typography>
                ) : discussions.length === 0 ? (
                    <Typography sx={{ textAlign: 'center', color: '#666', py: 2 }}>
                        No discussions yet. Be the first to comment!
                    </Typography>
                ) : (
                    discussions.map((post, index) => (
                        <Box key={post.id} sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Avatar sx={{ width: 40, height: 40, bgcolor: '#e8f5e9', color: '#1F8505', mt: 0.5 }}>
                                    {post.user.username[0]?.toUpperCase() || 'U'}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                        <Typography sx={{ fontWeight: 600, fontSize: 14, mr: 1 }}>
                                            {post.user.username}
                                        </Typography>
                                        <Typography sx={{ color: '#888', fontSize: 12 }}>
                                            Posted {formatTimeAgo(post.created_at)}
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ color: '#444', fontSize: 14, mb: 1, lineHeight: 1.5 }}>
                                        {post.content}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleLikePost(post.id)}
                                                sx={{ p: 0 }}
                                            >
                                                <FavoriteBorderIcon sx={{ color: '#666', fontSize: 16 }} />
                                            </IconButton>
                                            <Typography sx={{ fontSize: 12, color: '#666' }}>{post.interests}</Typography>
                                        </Box>
                                        {post.responses && post.responses.length > 0 && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <ChatBubbleOutlineIcon sx={{ color: '#666', fontSize: 16 }} />
                                                <Typography sx={{ fontSize: 12, color: '#666' }}>{post.responses.length}</Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    ))
                )}
            </Box>

            {/* Bottom Input Area */}
            <Box sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: '#fff',
                borderTop: '1px solid #e0e0e0',
                p: 2,
                maxWidth: 600,
                mx: 'auto'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: '#e8f5e9', color: '#1F8505' }}>U</Avatar>
                    <TextField
                        size="small"
                        placeholder="Discuss..."
                        fullWidth
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        sx={{
                            bgcolor: '#f8f9fa',
                            borderRadius: '25px',
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '25px',
                                '& fieldset': {
                                    borderColor: '#e0e0e0',
                                },
                            },
                        }}
                    />
                    <IconButton
                        onClick={handlePostComment}
                        disabled={!newPost.trim()}
                        sx={{
                            bgcolor: newPost.trim() ? '#1F8505' : '#e0e0e0',
                            color: '#fff',
                            '&:hover': {
                                bgcolor: newPost.trim() ? '#1a7a04' : '#e0e0e0',
                            },
                        }}
                    >
                        <SendIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Spacer to prevent content from being hidden behind fixed input */}
            <Box sx={{ height: 100 }} />
        </SinglePageLayout>
    );
};

export default Thread;
