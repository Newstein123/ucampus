import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SendIcon from '@mui/icons-material/Send';
import { Avatar, Box, Divider, IconButton, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiscussions } from '../hooks/useDiscussions';

interface DiscussionSectionProps {
    contributionId: number;
}

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

export const DiscussionSection: React.FC<DiscussionSectionProps> = ({ contributionId }) => {
    const navigate = useNavigate();
    const [comment, setComment] = useState('');

    const { discussions, loading, error, createDiscussion, updateInterest } = useDiscussions({
        contributionId,
        perPage: 10,
        page: 1,
    });

    const handleLikeComment = async (commentId: number) => {
        try {
            await updateInterest({ discussion_id: commentId });
        } catch (err) {
            console.error('Failed to update interest:', err);
        }
    };

    const handlePostComment = async () => {
        if (comment.trim()) {
            try {
                await createDiscussion({ content: comment.trim() });
                setComment('');
            } catch (err) {
                console.error('Failed to create discussion:', err);
            }
        }
    };

    const handleOpenThread = (discussionId: number) => {
        navigate(`/threads/${discussionId}`);
    };

    return (
        <Box>
            {/* Comment Input */}
            <Box sx={{ p: 2, pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: '#e8f5e9', color: '#1F8505' }}>U</Avatar>
                    <TextField
                        size="small"
                        placeholder="Discuss your opinion"
                        fullWidth
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
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
                        disabled={!comment.trim()}
                        sx={{
                            bgcolor: comment.trim() ? '#1F8505' : '#e0e0e0',
                            color: '#fff',
                            '&:hover': {
                                bgcolor: comment.trim() ? '#1a7a04' : '#e0e0e0',
                            },
                        }}
                    >
                        <SendIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Comments List */}
            <Box sx={{ p: 2, pt: 1 }}>
                {loading ? (
                    <Typography sx={{ textAlign: 'center', color: '#666', py: 2 }}>Loading discussions...</Typography>
                ) : error ? (
                    <Typography sx={{ textAlign: 'center', color: 'error.main', py: 2 }}>Error: {error}</Typography>
                ) : discussions.length === 0 ? (
                    <Typography sx={{ textAlign: 'center', color: '#666', py: 2 }}>No discussions yet. Be the first to comment!</Typography>
                ) : (
                    discussions.map((d, index) => (
                        <Box key={d.id} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Avatar sx={{ width: 40, height: 40, bgcolor: '#e8f5e9', color: '#1F8505', mt: 0.5 }}>
                                    {d.user.profileName[0]?.toUpperCase() || 'U'}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                        <Typography sx={{ fontWeight: 600, fontSize: 14, mr: 1 }}>{d.user.profileName}</Typography>
                                        <Typography sx={{ color: '#888', fontSize: 12 }}>Posted {formatTimeAgo(d.created_at)}</Typography>
                                    </Box>
                                    <Typography sx={{ color: '#444', fontSize: 14, mb: 1 }}>{d.content}</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleLikeComment(d.id)}
                                                sx={{
                                                    p: 0.5,
                                                    '&:hover': {
                                                        bgcolor: 'rgba(255, 82, 82, 0.1)',
                                                    },
                                                }}
                                            >
                                                {d.is_interested ? (
                                                    <FavoriteIcon sx={{ color: '#1F8505', fontSize: 16 }} />
                                                ) : (
                                                    <FavoriteBorderIcon
                                                        sx={{
                                                            color: '#444',
                                                            fontSize: 16,
                                                            '&:hover': { color: '#1F8505' },
                                                        }}
                                                    />
                                                )}
                                            </IconButton>
                                            <Typography sx={{ fontSize: 12, color: d.is_interested ? '#444' : '#666' }}>{d.interests}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <ChatBubbleOutlineIcon sx={{ color: '#666', fontSize: 16 }} />
                                            <Typography sx={{ fontSize: 12, color: '#666' }}>{d.responses?.length || 0} replies</Typography>
                                        </Box>
                                        <Typography
                                            sx={{ fontSize: 12, color: '#1F8505', fontWeight: 600, cursor: 'pointer' }}
                                            onClick={() => handleOpenThread(d.id)}
                                        >
                                            Open Thread
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            {index < discussions.length - 1 && <Divider sx={{ mt: 2, opacity: 0.3 }} />}
                        </Box>
                    ))
                )}
            </Box>
        </Box>
    );
};

export default DiscussionSection;
