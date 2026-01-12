import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LinkIcon from '@mui/icons-material/Link';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Avatar, Box, CardMedia, Chip, CircularProgress, IconButton, ListItemIcon, Menu, MenuItem, Paper, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { contributionApi } from '../../api/contribution';
import AppButton from '../../components/AppButton';
import ConfirmModal from '../../components/ConfirmModal';
import DiscussionSection from '../../components/DiscussionSection';
import SinglePageLayout from '../../components/SinglePageLayout';
import Toast from '../../components/Toast';
import useUserProfileQuery from '../../hooks/auth/useUserProfileQuery';
import useContributionBookmarkMutation from '../../hooks/contribution/useContributionBookmarkMutation';
import useContributionDetailQuery from '../../hooks/contribution/useContributionDetailQuery';
import { useDiscussions } from '../../hooks/useDiscussions';

const DEFAULT_IMAGE = '/assets/images/idea-sample.png';

const IdeaDetails: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { data: userProfile } = useUserProfileQuery();
    const { data: ideaResponse, isLoading } = useContributionDetailQuery(parseInt(id || '0'));
    const idea = ideaResponse?.data;
    const { discussions } = useDiscussions({
        contributionId: parseInt(id || '1'),
        perPage: 10,
        page: 1,
    });

    // Menu state
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(menuAnchorEl);

    // Delete modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Toast state
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    // Show toast from navigation state (e.g., after edit)
    useEffect(() => {
        if (location.state && typeof location.state === 'object') {
            const state = location.state as { toastMessage?: string; toastType?: 'success' | 'error' };
            if (state.toastMessage) {
                setToastMessage(state.toastMessage);
                setToastType(state.toastType || 'success');
                setToastOpen(true);
            }
        }
    }, [location.state]);

    // Bookmark mutation - uses query invalidation for cache updates
    const bookmarkMutation = useContributionBookmarkMutation({
        onError: (error) => {
            console.error('Failed to update bookmark:', error);
            setToastMessage('Failed to update bookmark');
            setToastType('error');
            setToastOpen(true);
        },
    });

    // Show loading spinner while fetching data
    if (isLoading) {
        return (
            <SinglePageLayout title={t('Idea Details')}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <CircularProgress sx={{ color: '#1F8505' }} />
                </Box>
            </SinglePageLayout>
        );
    }

    const handleBookmark = () => {
        if (!id) return;
        bookmarkMutation.mutate(parseInt(id));
    };

    const isOwner = userProfile?.data?.id === idea?.user?.id;

    const handleUpgradeToProject = () => {
        navigate(`/contribution/create-project?ideaId=${id}`);
    };

    // Menu handlers
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    const handleEdit = () => {
        handleMenuClose();
        navigate(`/contribution/edit-idea/${id}`);
    };

    const handleDeleteClick = () => {
        handleMenuClose();
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!id) return;
        setIsDeleting(true);
        try {
            await contributionApi.delete(parseInt(id));
            setToastMessage('Idea deleted successfully');
            setToastType('success');
            setToastOpen(true);
            setTimeout(() => navigate('/my-ideas-and-questions', { replace: true }), 1500);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const errorMsg = err.response?.data?.message || 'Failed to delete idea';
            setToastMessage(errorMsg);
            setToastType('error');
            setToastOpen(true);
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <SinglePageLayout
            title={t('Idea Details')}
            rightElement={
                isOwner ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton
                            size="small"
                            onClick={handleBookmark}
                            disabled={bookmarkMutation.isPending}
                            sx={{
                                color: idea?.is_bookmarked ? '#1F8505' : '#ccc',
                                '&:hover': {
                                    color: idea?.is_bookmarked ? '#165d04' : '#1F8505',
                                },
                            }}
                        >
                            {idea?.is_bookmarked ? <BookmarkIcon sx={{ fontSize: 20 }} /> : <BookmarkBorderIcon sx={{ fontSize: 20 }} />}
                        </IconButton>
                        <IconButton size="small" onClick={handleMenuOpen} sx={{ color: '#666' }}>
                            <MoreVertIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Box>
                ) : (
                    <IconButton
                        size="small"
                        onClick={handleBookmark}
                        disabled={bookmarkMutation.isPending}
                        sx={{
                            color: idea?.is_bookmarked ? '#1F8505' : '#ccc',
                            '&:hover': {
                                color: idea?.is_bookmarked ? '#165d04' : '#1F8505',
                            },
                        }}
                    >
                        {idea?.is_bookmarked ? <BookmarkIcon sx={{ fontSize: 20 }} /> : <BookmarkBorderIcon sx={{ fontSize: 20 }} />}
                    </IconButton>
                )
            }
        >
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
                        <AppButton startIcon={<UpgradeIcon />} onClick={handleUpgradeToProject} fullWidth sx={{ py: 1, fontSize: 14 }}>
                            Upgrade to Project
                        </AppButton>
                    </Box>
                )}
            </Box>

            {/* Thumbnail */}
            {idea?.thumbnail_url && (
                <CardMedia
                    component="img"
                    image={idea.thumbnail_url || DEFAULT_IMAGE}
                    alt={idea?.title || 'thumbnail'}
                    sx={{ width: '100%', borderRadius: 0, mb: 2, objectFit: 'contain', maxHeight: '70vh' }}
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

                {/* References */}
                {(() => {
                    let references: string[] = [];
                    if (idea?.content?.references) {
                        try {
                            references = typeof idea.content.references === 'string' ? JSON.parse(idea.content.references) : idea.content.references;
                            if (!Array.isArray(references)) {
                                references = [];
                            }
                        } catch {
                            references = [];
                        }
                    }
                    return references.length > 0 ? (
                        <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>References</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {references.map((ref, idx) => (
                                    <Box
                                        key={idx}
                                        component="a"
                                        href={ref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{
                                            color: '#1976d2',
                                            fontSize: 14,
                                            textDecoration: 'none',
                                            '&:hover': { textDecoration: 'underline' },
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                        }}
                                    >
                                        <LinkIcon sx={{ fontSize: 16 }} />
                                        {ref}
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    ) : null;
                })()}
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

            {/* Owner Actions Menu */}
            <Menu
                anchorEl={menuAnchorEl}
                open={isMenuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    sx: { borderRadius: 2, minWidth: 150, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
                }}
            >
                <MenuItem onClick={handleEdit} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                        <EditIcon sx={{ color: '#1F8505' }} />
                    </ListItemIcon>
                    <Typography sx={{ fontWeight: 500 }}>Edit</Typography>
                </MenuItem>
                <MenuItem onClick={handleDeleteClick} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                        <DeleteIcon sx={{ color: '#f44336' }} />
                    </ListItemIcon>
                    <Typography sx={{ fontWeight: 500, color: '#f44336' }}>Delete</Typography>
                </MenuItem>
            </Menu>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={isDeleteModalOpen}
                title="Delete Idea"
                message="Are you sure you want to delete this idea? This action cannot be undone."
                onConfirm={handleDeleteConfirm}
                onCancel={() => setIsDeleteModalOpen(false)}
                isLoading={isDeleting}
                confirmText="Delete"
                confirmColor="error"
            />

            {/* Toast */}
            <Toast open={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
        </SinglePageLayout>
    );
};

export default IdeaDetails;
