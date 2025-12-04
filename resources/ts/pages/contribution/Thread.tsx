import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SendIcon from '@mui/icons-material/Send';
import { Avatar, Box, IconButton, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SinglePageLayout from '../../components/SinglePageLayout';

const mockThreadPosts = [
    {
        id: 1,
        user: { name: 'Adom Shafi', avatar: '' },
        content:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus.',
        postedAgo: '2d ago',
        likes: 124,
        comments: 123,
        isLiked: true,
    },
    {
        id: 2,
        user: { name: 'Min Thurein', avatar: '' },
        content:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus.',
        postedAgo: '1hr ago',
        likes: 124,
        comments: 0,
        isLiked: false,
    },
    {
        id: 3,
        user: { name: 'Min Thet Paing', avatar: '' },
        content:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus.',
        postedAgo: '2hr ago',
        likes: 124,
        comments: 0,
        isLiked: false,
    },
];

const Thread: React.FC = () => {
    const { t } = useTranslation();
    const [posts, setPosts] = useState(mockThreadPosts);
    const [newPost, setNewPost] = useState('');

    const handleLikePost = (postId: number) => {
        setPosts((prev) =>
            prev.map((post) =>
                post.id === postId ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 } : post,
            ),
        );
    };

    const handlePostComment = () => {
        if (newPost.trim()) {
            const newThreadPost = {
                id: Date.now(),
                user: { name: 'You', avatar: '' },
                content: newPost.trim(),
                postedAgo: 'Just now',
                likes: 0,
                comments: 0,
                isLiked: false,
            };
            setPosts((prev) => [newThreadPost, ...prev]);
            setNewPost('');
        }
    };

    return (
        <SinglePageLayout
            title={t('Thread')}
            rightElement={<Typography sx={{ fontWeight: 600, fontSize: 14, color: '#666' }}>Adom Shafi</Typography>}
        >
            {/* Thread Posts */}
            <Box sx={{ p: 2, pb: 0 }}>
                {posts.map((post) => (
                    <Box key={post.id} sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Avatar sx={{ width: 40, height: 40, bgcolor: '#e8f5e9', color: '#1F8505', mt: 0.5 }}>{post.user.name[0]}</Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                    <Typography sx={{ fontWeight: 600, fontSize: 14, mr: 1 }}>{post.user.name}</Typography>
                                    <Typography sx={{ color: '#888', fontSize: 12 }}>Posted {post.postedAgo}</Typography>
                                </Box>
                                <Typography sx={{ color: '#444', fontSize: 14, mb: 1, lineHeight: 1.5 }}>{post.content}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <IconButton size="small" onClick={() => handleLikePost(post.id)} sx={{ p: 0 }}>
                                            {post.isLiked ? (
                                                <FavoriteIcon sx={{ color: '#1F8505', fontSize: 16 }} />
                                            ) : (
                                                <FavoriteBorderIcon sx={{ color: '#666', fontSize: 16 }} />
                                            )}
                                        </IconButton>
                                        <Typography sx={{ fontSize: 12, color: '#666' }}>{post.likes}</Typography>
                                    </Box>
                                    {post.comments > 0 && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <ChatBubbleOutlineIcon sx={{ color: '#666', fontSize: 16 }} />
                                            <Typography sx={{ fontSize: 12, color: '#666' }}>{post.comments}</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Bottom Input Area */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: '#fff',
                    borderTop: '1px solid #e0e0e0',
                    p: 2,
                    maxWidth: 600,
                    mx: 'auto',
                }}
            >
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
