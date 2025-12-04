import BookmarkIcon from '@mui/icons-material/Bookmark';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DownloadIcon from '@mui/icons-material/Download';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import MailIcon from '@mui/icons-material/Mail';
import SendIcon from '@mui/icons-material/Send';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
    Avatar,
    Box,
    Button,
    CardMedia,
    Chip,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SinglePageLayout from '../../components/SinglePageLayout';
import { useTranslation } from 'react-i18next';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useDiscussions } from '../../hooks/useDiscussions';
import { Discussion } from '../../types/discussion';
import { contributionApi } from '../../api/contribution';
import { Contribution } from '../../types/contribution';

const DEFAULT_IMAGE = '/assets/images/idea-sample.png';

// Mock team members (UI-only; backend not wired yet)
const mockTeamMembers = [
    { name: 'Adom Shafi', avatar: '', role: 'Frontend Developer' },
    { name: 'Sarah Chen', avatar: '', role: 'UI/UX Designer' },
    { name: 'Mike Johnson', avatar: '', role: 'Backend Developer' },
    { name: 'Lisa Wang', avatar: '', role: 'Product Manager' },
];

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

const ProjectDetails: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [comment, setComment] = useState('');
    const [project, setProject] = useState<Contribution | null>(null);
    const [loadingProject, setLoadingProject] = useState<boolean>(true);
    
    // Use the discussions hook
    const {
        discussions,
        loading,
        error,
        createDiscussion,
        updateInterest
    } = useDiscussions({
        contributionId: parseInt(id || '1'),
        perPage: 10,
        page: 1
    });

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            try {
                setLoadingProject(true);
                const res = await contributionApi.show(parseInt(id));
                setProject(res.data);
            } finally {
                setLoadingProject(false);
            }
        };
        load();
    }, [id]);

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
                await createDiscussion({
                    content: comment.trim(),
                });
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
        <SinglePageLayout title={t('Project Details')} rightElement={<BookmarkIcon sx={{ color: '#ccc', fontSize: 20, cursor: 'pointer' }} />}>
            {/* Tags */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1, p: 2 }}>
                {project?.tags?.map((tag) => (
                    <Chip key={tag} label={`#${tag.toUpperCase()}`} sx={{ bgcolor: '#e8f5e9', color: '#1F8505', fontWeight: 600, fontSize: 13 }} />
                ))}
            </Box>

            {/* Title & Author */}
            <Box sx={{ p: 2, pb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.3 }}>
                    {project?.title || 'Loading...'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#e8f5e9', mr: 1 }}>{project?.user?.name?.[0] || 'U'}</Avatar>
                    <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: 15 }}>{project?.user?.name}</Typography>
                        <Typography sx={{ color: '#888', fontSize: 13 }}>{project?.created_at}</Typography>
                    </Box>
                </Box>
            </Box>

            {/* Thumbnail */}
            <CardMedia
                component="img"
                image={project?.thumbnail_url || DEFAULT_IMAGE}
                alt={project?.title || 'thumbnail'}
                sx={{ width: '100%', borderRadius: 0, mb: 2, maxHeight: 200, objectFit: 'cover' }}
            />

            {/* Description */}
            <Box sx={{ p: 2, pb: 1 }}>
                <Typography sx={{ color: '#222', fontSize: 15, mb: 2 }}>{project?.content?.description}</Typography>
            </Box>

            {/* Project Details Sections */}
            <Box sx={{ p: 2, pt: 0 }}>
                {/* Problem & Solution */}
                <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Problem</Typography>
                    <Typography sx={{ color: '#444', fontSize: 14, mb: 2 }}>{project?.content?.problem}</Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Solution</Typography>
                    <Typography sx={{ color: '#444', fontSize: 14, mb: 2 }}>{project?.content?.solution}</Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Who Benefits</Typography>
                    <Typography sx={{ color: '#444', fontSize: 14 }}>{project?.content?.impact}</Typography>
                </Paper>

                {/* Resources */}
                <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Resources</Typography>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {(project?.content?.resources ? String(project.content.resources).split(/[,\n]/) : []).map((r, i) => (
                            <li key={i} style={{ color: '#444', fontSize: 14, marginBottom: 2 }}>
                                {r}
                            </li>
                        ))}
                    </ul>
                </Paper>

                {/* Attachments */}
                <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Attachments</Typography>
                    <List dense>
                        {([] as Array<{ name: string; url?: string }>).map((file) => (
                            <ListItem
                                key={file.name}
                                secondaryAction={
                                    <IconButton edge="end" aria-label="download">
                                        <DownloadIcon />
                                    </IconButton>
                                }
                            >
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: '#e8f5e9', color: '#1F8505', width: 32, height: 32 }}>
                                        {file.name.split('.').pop()?.toUpperCase() || 'F'}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={file.name} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>

                {/* Next Steps */}
                <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Next Steps</Typography>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {([] as string[]).map((step, i) => (
                            <li key={i} style={{ color: '#444', fontSize: 14, marginBottom: 2 }}>
                                {step}
                            </li>
                        ))}
                    </ul>
                </Paper>
            </Box>

            {/* Team Members Section */}
            <Box sx={{ p: 2, pb: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 17, mb: 2, textAlign: 'center' }}>Team Members</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 2 }}>
                    {mockTeamMembers.map((member, index) => (
                        <Box key={index} sx={{ textAlign: 'center' }}>
                            <Avatar sx={{ width: 60, height: 60, bgcolor: '#e8f5e9', color: '#1F8505', mx: 'auto', mb: 1 }}>{member.name[0]}</Avatar>
                            <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{member.name}</Typography>
                        </Box>
                    ))}
                </Box>
                <Button
                    variant="contained"
                    sx={{
                        bgcolor: '#1F8505',
                        color: '#fff',
                        borderRadius: '25px',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: 16,
                        py: 1.5,
                        px: 4,
                        width: '100%',
                        position: 'relative',
                    }}
                >
                    Join this team
                    <Box
                        sx={{
                            position: 'absolute',
                            right: -8,
                            top: -8,
                            bgcolor: '#1F8505',
                            color: '#fff',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 600,
                            border: '2px solid #fff',
                        }}
                    >
                        <MailIcon sx={{ fontSize: 14 }} />
                    </Box>
                </Button>
            </Box>

            {/* Engagement Metrics */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, p: 2, pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FavoriteBorderIcon sx={{ color: '#666', fontSize: 20 }} />
                    <Typography sx={{ fontSize: 14, color: '#666' }}>{0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VisibilityIcon sx={{ color: '#666', fontSize: 20 }} />
                    <Typography sx={{ fontSize: 14, color: '#666' }}>{0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ChatBubbleOutlineIcon sx={{ color: '#666', fontSize: 20 }} />
                    <Typography sx={{ fontSize: 14, color: '#666' }}>{discussions.length}</Typography>
                </Box>
            </Box>

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
                    discussions.map((d, index) => (
                        <Box key={d.id} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Avatar sx={{ width: 40, height: 40, bgcolor: '#e8f5e9', color: '#1F8505', mt: 0.5 }}>
                                    {d.user.profileName[0]?.toUpperCase() || 'U'}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                        <Typography sx={{ fontWeight: 600, fontSize: 14, mr: 1 }}>
                                            {d.user.profileName}
                                        </Typography>
                                        <Typography sx={{ color: '#888', fontSize: 12 }}>
                                            Posted {formatTimeAgo(d.created_at)}
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ color: '#444', fontSize: 14, mb: 1 }}>
                                        {d.content}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleLikeComment(d.id)}
                                                sx={{ p: 0 }}
                                            >
                                                <FavoriteBorderIcon sx={{ color: '#666', fontSize: 16 }} />
                                            </IconButton>
                                            <Typography sx={{ fontSize: 12, color: '#666' }}>{d.interests}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <ChatBubbleOutlineIcon sx={{ color: '#666', fontSize: 16 }} />
                                            <Typography sx={{ fontSize: 12, color: '#666' }}>
                                                {d.responses?.length || 0} replies
                                            </Typography>
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
        </SinglePageLayout>
    );
};

export default ProjectDetails;
