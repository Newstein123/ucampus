import BookmarkIcon from '@mui/icons-material/Bookmark';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Avatar, Box, Button, CardMedia, Chip, Paper, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { contributionApi } from '../../api/contribution';
import DiscussionSection from '../../components/DiscussionSection';
import SinglePageLayout from '../../components/SinglePageLayout';
import useUserProfileQuery from '../../hooks/auth/useUserProfileQuery';
import { useDiscussions } from '../../hooks/useDiscussions';
import { Contribution } from '../../types/contribution';

const DEFAULT_IMAGE = '/assets/images/idea-sample.png';

const IdeaDetails: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: userProfile } = useUserProfileQuery();
    const [idea, setIdea] = useState<Contribution | null>(null);
    const { discussions } = useDiscussions({
        contributionId: parseInt(id || '1'),
        perPage: 10,
        page: 1,
    });

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            const res = await contributionApi.show(parseInt(id));
            setIdea(res.data);
        };
        load();
    }, [id]);

    const isOwner = userProfile?.data?.id === idea?.user?.id;

    const handleUpgradeToProject = () => {
        // Navigate to project create page with idea data pre-filled
        navigate(`/contribution/create-project?ideaId=${id}`);
    };

    return (
        <SinglePageLayout title={t('Idea Details')} rightElement={<BookmarkIcon sx={{ color: '#ccc', fontSize: 20, cursor: 'pointer' }} />}>
            {/* Tags */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1, p: 2 }}>
                {idea?.tags?.map((tag) => (
                    <Chip key={tag} label={tag.toUpperCase()} sx={{ bgcolor: '#e8f5e9', color: '#1F8505', fontWeight: 600, fontSize: 11 }} />
                ))}
            </Box>

            {/* Title & Author */}
            <Box sx={{ p: 2, pb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, lineHeight: 1.3 }}>
                    {idea?.title || 'Loading...'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#e8f5e9', mr: 1 }}>{idea?.user?.name?.[0] || 'U'}</Avatar>
                    <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: 15 }}>{idea?.user?.name}</Typography>
                        <Typography sx={{ color: '#888', fontSize: 13 }}>{idea?.created_at}</Typography>
                    </Box>
                </Box>

                {/* Upgrade to Project Button - Only show if user is the owner */}
                {isOwner && (
                    <Box sx={{ mb: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<UpgradeIcon />}
                            onClick={handleUpgradeToProject}
                            sx={{
                                bgcolor: '#1F8505',
                                color: '#fff',
                                fontWeight: 600,
                                borderRadius: 2,
                                textTransform: 'none',
                                '&:hover': { bgcolor: '#156c0c' },
                            }}
                            fullWidth
                        >
                            Upgrade to Project
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Thumbnail */}
            {idea?.thumbnail_url && (
                <CardMedia
                    component="img"
                    image={idea.thumbnail_url || DEFAULT_IMAGE}
                    alt={idea?.title || 'thumbnail'}
                    sx={{ width: '100%', borderRadius: 0, mb: 2, maxHeight: 200, objectFit: 'cover' }}
                />
            )}

            {/* Problem, Thought & Why It Matters Sections */}
            <Box sx={{ p: 2, pt: 0 }}>
                {/* Problem */}
                {idea?.content?.problem && (
                    <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Problem</Typography>
                        <Typography sx={{ color: '#444', fontSize: 14 }}>{idea.content.problem}</Typography>
                    </Paper>
                )}

                {/* Thought */}
                {idea?.content?.thought && (
                    <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Thought</Typography>
                        <Typography sx={{ color: '#444', fontSize: 14 }}>{idea.content.thought}</Typography>
                    </Paper>
                )}

                {/* Why It Matters */}
                {idea?.content?.why_it_matters && (
                    <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Why It Matters</Typography>
                        <Typography sx={{ color: '#444', fontSize: 14 }}>{idea.content.why_it_matters}</Typography>
                    </Paper>
                )}
            </Box>

            {/* Engagement Metrics */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, p: 2, pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FavoriteBorderIcon sx={{ color: '#666', fontSize: 20 }} />
                    <Typography sx={{ fontSize: 14, color: '#666' }}>{idea?.likes_count}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VisibilityIcon sx={{ color: '#666', fontSize: 20 }} />
                    <Typography sx={{ fontSize: 14, color: '#666' }}>{idea?.views_count}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ChatBubbleOutlineIcon sx={{ color: '#666', fontSize: 20 }} />
                    <Typography sx={{ fontSize: 14, color: '#666' }}>{discussions.length}</Typography>
                </Box>
            </Box>

            <DiscussionSection contributionId={parseInt(id || '1')} />
        </SinglePageLayout>
    );
};

export default IdeaDetails;
