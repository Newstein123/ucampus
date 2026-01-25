import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
    Avatar,
    Box,
    CardMedia,
    CircularProgress,
    List,
    ListItem,
    ListItemAvatar,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { contributionApi } from '../../api/contribution';
import ConfirmModal from '../../components/ConfirmModal';
import SinglePageLayout from '../../components/SinglePageLayout';
import Toast from '../../components/Toast';
import useUserProfileQuery from '../../hooks/auth/useUserProfileQuery';
import useMyContributionsQuery from '../../hooks/contribution/useMyContributionsQuery';
import { Contribution } from '../../types/contribution';

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return dateString;
    }
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return '1 day ago';
    if (diff < 7) return `${diff} days ago`;
    return date.toLocaleDateString(undefined, { month: 'long', day: '2-digit', year: 'numeric' });
}

interface ContributionItemProps {
    contribution: Contribution;
    type: 'idea' | 'question';
    onEdit: (id: number, type: 'idea' | 'question') => void;
    onDelete: (id: number, type: 'idea' | 'question') => void;
}

const ContributionItem: React.FC<ContributionItemProps> = ({ contribution, type, onEdit, onDelete }) => {
    const navigate = useNavigate();
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(menuAnchorEl);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    const handleEdit = (event: React.MouseEvent) => {
        event.stopPropagation();
        handleMenuClose();
        onEdit(contribution.id, type);
    };

    const handleDelete = (event: React.MouseEvent) => {
        event.stopPropagation();
        handleMenuClose();
        onDelete(contribution.id, type);
    };

    const handleNavigate = () => {
        const path = type === 'idea' ? `/ideas/${contribution.id}` : `/questions/${contribution.id}`;
        navigate(path);
    };

    return (
        <>
            <ListItem
                sx={{
                    bgcolor: '#fff',
                    borderRadius: 3,
                    mb: 2,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    p: 1.5,
                    alignItems: 'flex-start',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        boxShadow: '0 4px 16px rgba(41, 67, 35, 0.08)',
                        transform: 'translateY(-2px)',
                    },
                }}
                onClick={handleNavigate}
            >
                <ListItemAvatar>
                    <Avatar
                        variant="rounded"
                        src={type === 'idea' ? contribution.thumbnail_url || undefined : undefined}
                        sx={{
                            width: 56,
                            height: 56,
                            mr: 2,
                            bgcolor: '#e8f5e9',
                            color: '#1F8505',
                            fontWeight: type === 'question' ? 700 : 400,
                            fontSize: type === 'question' ? 28 : 16,
                        }}
                    >
                        {type === 'question' ? '?' : !contribution.thumbnail_url && contribution.title?.[0]?.toUpperCase()}
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={<Typography sx={{ fontWeight: 700, fontSize: 15, color: '#222' }}>{contribution.title}</Typography>}
                    secondary={<Typography sx={{ color: '#aaa', fontSize: 13, mt: 0.5 }}>{formatDate(contribution.created_at)}</Typography>}
                />
                <Box
                    onClick={handleMenuOpen}
                    sx={{
                        p: 1,
                        cursor: 'pointer',
                        color: '#666',
                        '&:hover': { color: '#333' },
                    }}
                >
                    <MoreVertIcon sx={{ fontSize: 20 }} />
                </Box>
            </ListItem>

            {/* Menu */}
            <Menu
                anchorEl={menuAnchorEl}
                open={isMenuOpen}
                onClose={handleMenuClose}
                onClick={(e) => e.stopPropagation()}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    sx: { borderRadius: 2, minWidth: 120, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
                }}
            >
                <MenuItem onClick={handleEdit} sx={{ py: 1 }}>
                    <ListItemIcon>
                        <EditIcon sx={{ color: '#1F8505', fontSize: 18 }} />
                    </ListItemIcon>
                    <Typography sx={{ fontWeight: 500, fontSize: 14 }}>Edit</Typography>
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ py: 1 }}>
                    <ListItemIcon>
                        <DeleteIcon sx={{ color: '#f44336', fontSize: 18 }} />
                    </ListItemIcon>
                    <Typography sx={{ fontWeight: 500, fontSize: 14, color: '#f44336' }}>Delete</Typography>
                </MenuItem>
            </Menu>
        </>
    );
};

const MyIdeasAndQuestions: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data: userProfile, isLoading: userProfileLoading } = useUserProfileQuery();
    const userId = userProfile?.data?.id;

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: number; type: 'idea' | 'question' } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Toast state
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    // Fetch user's ideas
    const {
        data: ideasData,
        isLoading: ideasLoading,
        refetch: refetchIdeas,
    } = useMyContributionsQuery({
        type: 'idea',
        userId: userId || 0,
        perPage: 20,
        enabled: !!userId,
    });

    // Fetch user's questions
    const {
        data: questionsData,
        isLoading: questionsLoading,
        refetch: refetchQuestions,
    } = useMyContributionsQuery({
        type: 'question',
        userId: userId || 0,
        perPage: 20,
        enabled: !!userId,
    });

    const ideas: Contribution[] = ideasData?.data || [];
    const questions: Contribution[] = questionsData?.data || [];

    const handleEdit = (id: number, type: 'idea' | 'question') => {
        const path = type === 'idea' ? `/contribution/edit-idea/${id}` : `/contribution/edit-question/${id}`;
        navigate(path);
    };

    const handleDeleteClick = (id: number, type: 'idea' | 'question') => {
        setItemToDelete({ id, type });
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        try {
            await contributionApi.delete(itemToDelete.id);
            setToastMessage(`${itemToDelete.type === 'idea' ? 'Idea' : 'Question'} deleted successfully`);
            setToastType('success');
            setToastOpen(true);

            // Refetch the appropriate list
            if (itemToDelete.type === 'idea') {
                refetchIdeas();
            } else {
                refetchQuestions();
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const errorMsg = err.response?.data?.message || `Failed to delete ${itemToDelete.type}`;
            setToastMessage(errorMsg);
            setToastType('error');
            setToastOpen(true);
        } finally {
            setIsDeleting(false);
            setDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    return (
        <SinglePageLayout title={t('My ideas and questions')} bgColor="#fafdff">
            {(() => {
                const isLoading = ideasLoading || questionsLoading || userProfileLoading;
                const isEmpty = !isLoading && ideas.length === 0 && questions.length === 0;

                if (isLoading) {
                    return (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                            <CircularProgress sx={{ color: '#1F8505' }} />
                        </Box>
                    );
                }

                if (isEmpty) {
                    return (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '80vh',
                                px: 2,
                                pt: 3,
                                pb: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 3,
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    image="/assets/images/empty-projects.png"
                                    alt="empty"
                                    sx={{ width: 100, height: 100, opacity: 0.9 }}
                                />
                            </Box>

                            <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 1 }}>Nothing here. For now.</Typography>
                            <Typography sx={{ color: '#777', textAlign: 'center', maxWidth: 280, mb: 2 }}>
                                This is where you'll find your ideas and questions.
                            </Typography>
                        </Box>
                    );
                }

                return (
                    <Paper elevation={0} sx={{ bgcolor: '#fafdff', borderRadius: 3, p: 0, boxShadow: 'none', minHeight: '100vh' }}>
                        {/* Section: Ideas */}
                        {ideas.length > 0 && (
                            <>
                                <Typography sx={{ fontWeight: 700, fontSize: 16, px: 2, pt: 2, pb: 1 }}>{t('Ideas')}</Typography>
                                <List sx={{ px: 1 }}>
                                    {ideas.map((idea) => (
                                        <ContributionItem
                                            key={idea.id}
                                            contribution={idea}
                                            type="idea"
                                            onEdit={handleEdit}
                                            onDelete={handleDeleteClick}
                                        />
                                    ))}
                                </List>
                            </>
                        )}
                        {/* Show "No ideas yet" only if there are questions but no ideas */}
                        {!ideas.length && questions.length > 0 && (
                            <>
                                <Typography sx={{ fontWeight: 700, fontSize: 16, px: 2, pt: 2, pb: 1 }}>{t('Ideas')}</Typography>
                                <Typography sx={{ color: '#888', px: 2, py: 2, textAlign: 'center' }}>{t('No ideas yet')}</Typography>
                            </>
                        )}

                        {/* Section: Questions */}
                        {questions.length > 0 && (
                            <>
                                <Typography sx={{ fontWeight: 700, fontSize: 16, px: 2, pt: 1, pb: 1 }}>{t('Questions')}</Typography>
                                <List sx={{ px: 1 }}>
                                    {questions.map((q) => (
                                        <ContributionItem
                                            key={q.id}
                                            contribution={q}
                                            type="question"
                                            onEdit={handleEdit}
                                            onDelete={handleDeleteClick}
                                        />
                                    ))}
                                </List>
                            </>
                        )}
                        {/* Show "No questions yet" only if there are ideas but no questions */}
                        {!questions.length && ideas.length > 0 && (
                            <>
                                <Typography sx={{ fontWeight: 700, fontSize: 16, px: 2, pt: 1, pb: 1 }}>{t('Questions')}</Typography>
                                <Typography sx={{ color: '#888', px: 2, py: 2, textAlign: 'center' }}>{t('No questions yet')}</Typography>
                            </>
                        )}
                    </Paper>
                );
            })()}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={deleteModalOpen}
                title={`Delete ${itemToDelete?.type === 'idea' ? 'Idea' : 'Question'}`}
                message={`Are you sure you want to delete this ${itemToDelete?.type}? This action cannot be undone.`}
                onConfirm={handleDeleteConfirm}
                onCancel={() => {
                    setDeleteModalOpen(false);
                    setItemToDelete(null);
                }}
                isLoading={isDeleting}
                confirmText="Delete"
                confirmColor="error"
            />

            {/* Toast */}
            <Toast open={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
        </SinglePageLayout>
    );
};

export default MyIdeasAndQuestions;
