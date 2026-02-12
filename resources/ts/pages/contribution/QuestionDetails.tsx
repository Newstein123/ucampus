import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Avatar, Box, Chip, CircularProgress, IconButton, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ConfirmModal from '../../components/ConfirmModal';
import DiscussionSection from '../../components/DiscussionSection';
import SEO from '../../components/SEO';
import ShareArrowIcon from '../../components/ShareArrowIcon';
import ShareBottomSheet from '../../components/ShareBottomSheet';
import SinglePageLayout from '../../components/SinglePageLayout';
import Toast from '../../components/Toast';
import { useDiscussions } from '../../hooks/useDiscussions';

import { contributionApi } from '../../api/contribution';
import useUserProfileQuery from '../../hooks/auth/useUserProfileQuery';
import useContributionBookmarkMutation from '../../hooks/contribution/useContributionBookmarkMutation';
import useContributionDetailQuery from '../../hooks/contribution/useContributionDetailQuery';

const QuestionDetails: React.FC = () => {
    const { t } = useTranslation();
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { data: userProfile } = useUserProfileQuery();
    const { data: questionResponse, isLoading } = useContributionDetailQuery(slug || '');
    const question = questionResponse?.data;
    // Derive id from question for backwards compatibility
    const id = question?.id?.toString() || '0';
    const { discussions } = useDiscussions({
        contributionId: question?.id || 0,
        perPage: 10,
        page: 1,
    });

    // Menu state
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(menuAnchorEl);

    // Delete modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Share bottom sheet state
    const [isShareOpen, setIsShareOpen] = useState(false);
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
            <SinglePageLayout title={t('Question Details')}>
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

    const isOwner = userProfile?.data?.id === question?.user?.id;

    // Menu handlers
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    const handleEdit = () => {
        handleMenuClose();
        navigate(`/contribution/edit-question/${id}`);
    };

    const handleDeleteClick = () => {
        handleMenuClose();
        setIsDeleteModalOpen(true);
    };

    const handleShareClick = () => {
        setIsShareOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!id) return;
        setIsDeleting(true);
        try {
            await contributionApi.delete(parseInt(id));
            setToastMessage('Question deleted successfully');
            setToastType('success');
            setToastOpen(true);
            setTimeout(() => navigate('/my-ideas-and-questions', { replace: true }), 1500);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const errorMsg = err.response?.data?.message || 'Failed to delete question';
            setToastMessage(errorMsg);
            setToastType('error');
            setToastOpen(true);
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <>
            {question && <SEO title={question.title} description={(question.content?.thought || '').substring(0, 200)} type="article" />}
            <SinglePageLayout
                title={t('Question Details')}
                rightElement={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton
                            size="small"
                            onClick={handleShareClick}
                            sx={{
                                color: '#666',
                                '&:hover': {
                                    color: '#1F8505',
                                },
                            }}
                        >
                            <ShareArrowIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={handleBookmark}
                            disabled={bookmarkMutation.isPending}
                            sx={{
                                color: question?.is_bookmarked ? '#1F8505' : '#ccc',
                                '&:hover': {
                                    color: question?.is_bookmarked ? '#165d04' : '#1F8505',
                                },
                            }}
                        >
                            {question?.is_bookmarked ? <BookmarkIcon sx={{ fontSize: 20 }} /> : <BookmarkBorderIcon sx={{ fontSize: 20 }} />}
                        </IconButton>
                        {isOwner && (
                            <IconButton size="small" onClick={handleMenuOpen} sx={{ color: '#666' }}>
                                <MoreVertIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                        )}
                    </Box>
                }
            >
                {/* Tags */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1, p: 2 }}>
                    {question?.tags?.map((tag) => (
                        <Chip key={tag} label={tag.toUpperCase()} sx={{ bgcolor: '#e8f5e9', color: '#1F8505', fontWeight: 600, fontSize: 11 }} />
                    ))}
                </Box>

                {/* Title & Author */}
                <Box sx={{ p: 2, pb: 1, pt: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, lineHeight: 1.3 }}>
                        {question?.title || 'Loading...'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#e8f5e9', mr: 1 }}>{question?.user?.name?.[0] || 'U'}</Avatar>
                        <Box>
                            <Typography sx={{ fontWeight: 600, fontSize: 15 }}>{question?.user?.name}</Typography>
                            <Typography sx={{ color: '#888', fontSize: 13 }}>Posted {question?.created_at}</Typography>
                        </Box>
                    </Box>

                    {/* Question Description */}
                    <Typography sx={{ color: '#222', fontSize: 14, mb: 2, lineHeight: 1.6 }}>{question?.content?.thought}</Typography>
                </Box>

                {/* Engagement Metrics */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, p: 2, pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FavoriteBorderIcon sx={{ color: '#666', fontSize: 20 }} />
                        <Typography sx={{ fontSize: 14, color: '#666' }}>{question?.likes_count}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VisibilityIcon sx={{ color: '#666', fontSize: 20 }} />
                        <Typography sx={{ fontSize: 14, color: '#666' }}>{question?.views_count}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ChatBubbleOutlineIcon sx={{ color: '#666', fontSize: 20 }} />
                        <Typography sx={{ fontSize: 14, color: '#666' }}>{discussions.length}</Typography>
                    </Box>
                </Box>

                {/* Discussion Section */}
                <DiscussionSection contributionId={question?.id || 0} />

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
                    title="Delete Question"
                    message="Are you sure you want to delete this question? This action cannot be undone."
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setIsDeleteModalOpen(false)}
                    isLoading={isDeleting}
                    confirmText="Delete"
                    confirmColor="error"
                />

                {/* Share Bottom Sheet */}
                <ShareBottomSheet
                    open={isShareOpen}
                    onClose={() => setIsShareOpen(false)}
                    title="Share Question"
                    shareUrl={`${window.location.origin}/share/question/${slug}`}
                    shareText={question?.title || 'Check out this question!'}
                />

                {/* Toast */}
                <Toast open={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
            </SinglePageLayout>
        </>
    );
};

export default QuestionDetails;
