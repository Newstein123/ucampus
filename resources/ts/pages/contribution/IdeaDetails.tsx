import BookmarkIcon from '@mui/icons-material/Bookmark';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DownloadIcon from '@mui/icons-material/Download';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Avatar, Box, CardMedia, Chip, IconButton, List, ListItem, ListItemAvatar, ListItemText, Paper, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { contributionApi } from '../../api/contribution';
import DiscussionSection from '../../components/DiscussionSection';
import SinglePageLayout from '../../components/SinglePageLayout';
import { useDiscussions } from '../../hooks/useDiscussions';
import { Contribution } from '../../types/contribution';

const DEFAULT_IMAGE = '/assets/images/idea-sample.png';

const IdeaDetails: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
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

                {/* Description */}
                <Typography sx={{ color: '#222', fontSize: 14, mb: 2, lineHeight: 1.6 }}>{idea?.content?.description}</Typography>
            </Box>

            {/* Thumbnail */}
            <CardMedia
                component="img"
                image={idea?.thumbnail_url || DEFAULT_IMAGE}
                alt={idea?.title || 'thumbnail'}
                sx={{ width: '100%', borderRadius: 0, mb: 2, maxHeight: 200, objectFit: 'cover' }}
            />

            {/* Problem, Solution & Who Benefits Sections */}
            <Box sx={{ p: 2, pt: 0 }}>
                {/* Problem */}
                {idea?.content?.problem && (
                    <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Problem</Typography>
                        <Typography sx={{ color: '#444', fontSize: 14 }}>{idea.content.problem}</Typography>
                    </Paper>
                )}

                {/* Solution */}
                {idea?.content?.solution && (
                    <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Solution</Typography>
                        <Typography sx={{ color: '#444', fontSize: 14 }}>{idea.content.solution}</Typography>
                    </Paper>
                )}

                {/* Who Benefits */}
                {idea?.content?.impact && (
                    <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Who Benefits</Typography>
                        <Typography sx={{ color: '#444', fontSize: 14 }}>{idea.content.impact}</Typography>
                    </Paper>
                )}

                {/* Resources */}
                {idea?.content?.resources && (
                    <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Resources</Typography>
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                            {String(idea.content.resources)
                                .split(/[,\n]/)
                                .map((r, i) => (
                                    <li key={i} style={{ color: '#444', fontSize: 14, marginBottom: 2 }}>
                                        {r.trim()}
                                    </li>
                                ))}
                        </ul>
                    </Paper>
                )}

                {/* Attachments */}
                {idea?.attachments && idea.attachments.length > 0 && (
                    <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Attachments</Typography>
                        <List dense>
                            {idea.attachments.map((file, index) => (
                                <ListItem
                                    key={index}
                                    secondaryAction={
                                        <IconButton edge="end" aria-label="download" href={file.url} download>
                                            <DownloadIcon />
                                        </IconButton>
                                    }
                                    sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 1 }}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: '#e8f5e9', color: '#1F8505', width: 32, height: 32 }}>
                                            {file.name?.split('.').pop()?.toUpperCase().substring(0, 3) || 'F'}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={file.name} />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                )}

                {/* Next Steps */}
                {idea?.content?.next_steps && (
                    <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px dashed #1F8505' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Next Steps</Typography>
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                            {String(idea.content.next_steps)
                                .split(/[,\n]/)
                                .map((step, i) => (
                                    <li key={i} style={{ color: '#444', fontSize: 14, marginBottom: 2 }}>
                                        {step.trim()}
                                    </li>
                                ))}
                        </ul>
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
