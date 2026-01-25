import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LinkIcon from '@mui/icons-material/Link';
import MailIcon from '@mui/icons-material/Mail';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NoteIcon from '@mui/icons-material/Note';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
    Avatar,
    Badge,
    Box,
    CardMedia,
    Chip,
    CircularProgress,
    IconButton,
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
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { contributionApi } from '../../api/contribution';
import AddNoteModal from '../../components/AddNoteModal';
import AppButton from '../../components/AppButton';
import ConfirmModal from '../../components/ConfirmModal';
import DiscussionSection from '../../components/DiscussionSection';
import FieldNotesList from '../../components/FieldNotesList';
import JoinTeamModal from '../../components/JoinTeamModal';
import LeaveProjectModal from '../../components/LeaveProjectModal';
import SinglePageLayout from '../../components/SinglePageLayout';
import SubmitEditRequestModal from '../../components/SubmitEditRequestModal';
import Toast from '../../components/Toast';
import {
    useCreateEditRequestMutation,
    useCreateNoteMutation,
    useEditRequestsQuery,
    useLeaveProjectMutation,
    useNotesQuery,
    useRejectNoteMutation,
    useResolveNoteMutation,
    useUpdateNoteMutation,
} from '../../hooks';
import useContributionBookmarkMutation from '../../hooks/contribution/useContributionBookmarkMutation';
import useContributionDetailQuery from '../../hooks/contribution/useContributionDetailQuery';
import { useDiscussions } from '../../hooks/useDiscussions';
import { selectUser } from '../../store/slices/authSlice';
import { ContributionNote, NoteType } from '../../types/contribution';

const DEFAULT_IMAGE = '/assets/images/idea-sample.png';

const ProjectDetails: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const location = useLocation();
    // Use TanStack Query for fetching project data
    const { data: projectResponse, isLoading, refetch } = useContributionDetailQuery(parseInt(id || '0'));
    const project = projectResponse?.data;
    const currentUser = useSelector(selectUser);

    // Show toast if navigation passed a success message
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

    // Modal and toast state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    // Menu state
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(menuAnchorEl);

    // Delete modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Leave modal state
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const leaveProjectMutation = useLeaveProjectMutation({
        onSuccess: () => {
            setToastMessage('Left from the project successfully');
            setToastType('success');
            setToastOpen(true);
            setIsLeaveModalOpen(false);
            // Reload project data using refetch
            refetch();
        },
        onError: (error) => {
            const errorMsg = error.response?.data?.message || error.response?.data?.errors?.left_reason?.[0] || 'Failed to leave project';
            setToastMessage(errorMsg);
            setToastType('error');
            setToastOpen(true);
        },
    });

    // Use the discussions hook
    const { discussions } = useDiscussions({
        contributionId: parseInt(id || '1'),
        perPage: 10,
        page: 1,
    });

    // Check if current user is the project owner
    const isOwner = currentUser?.id === project?.user?.id;
    // Check if user is an active collaborator (accepted or active status)
    const isCollaborator =
        currentUser &&
        project?.participants?.some((member) => member.user_id === currentUser.id && (member.status === 'accepted' || member.status === 'active'));
    // Check if user has a pending request
    const hasPendingRequest =
        currentUser && project?.participants?.some((member) => member.user_id === currentUser.id && member.status === 'pending');
    // Check if user can join: must be logged in, project allows collaboration, not the owner, and not already a collaborator
    const canJoin = currentUser && project?.allow_collab && !isOwner && !isCollaborator;
    // Show button if user can join OR has pending request (but hide if already joined)
    const showJoinButton = canJoin || hasPendingRequest;

    // Edit Request state
    const [isEditRequestModalOpen, setIsEditRequestModalOpen] = useState(false);
    const [selectedFieldForEdit, setSelectedFieldForEdit] = useState<string | null>(null);
    const { data: editRequestsData } = useEditRequestsQuery(parseInt(id || '0'));
    const editRequests = editRequestsData?.data?.edit_requests || [];

    // Helper function to count pending edit requests by field (for owners)
    const getPendingEditRequestCount = (fieldKey: string): number => {
        return editRequests.filter((req) => req.status === 'pending' && req.changes.content_key === fieldKey).length;
    };

    // Helper function to check if there are any edit requests (pending for owners, any for collaborators)
    const hasEditRequestsForField = (fieldKey: string): boolean => {
        if (isOwner) {
            // Owners see pending requests
            return getPendingEditRequestCount(fieldKey) > 0;
        }
        // Collaborators see if there are any edit requests (pending or history) for this field
        if (isCollaborator) {
            return editRequests.some((req) => req.changes.content_key === fieldKey);
        }
        return false;
    };

    // Edit Request mutations
    const createEditRequestMutation = useCreateEditRequestMutation();

    // Notes state - field-specific
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [selectedFieldForNote, setSelectedFieldForNote] = useState<string | null>(null);
    const [editingNote, setEditingNote] = useState<ContributionNote | null>(null);

    // Field-specific note queries
    const { data: problemNotesData } = useNotesQuery(parseInt(id || '0'), 100, 1, 'problem');
    const { data: solutionNotesData } = useNotesQuery(parseInt(id || '0'), 100, 1, 'solution');
    const { data: impactNotesData } = useNotesQuery(parseInt(id || '0'), 100, 1, 'impact');
    const { data: resourcesNotesData } = useNotesQuery(parseInt(id || '0'), 100, 1, 'resources');
    const { data: referencesNotesData } = useNotesQuery(parseInt(id || '0'), 100, 1, 'references');

    const problemNotes = problemNotesData?.data || [];
    const solutionNotes = solutionNotesData?.data || [];
    const impactNotes = impactNotesData?.data || [];
    const resourcesNotes = resourcesNotesData?.data || [];
    const referencesNotes = referencesNotesData?.data || [];

    // Notes mutations
    const createNoteMutation = useCreateNoteMutation();
    const updateNoteMutation = useUpdateNoteMutation();
    const resolveNoteMutation = useResolveNoteMutation();
    const rejectNoteMutation = useRejectNoteMutation();

    // Bookmark mutation - uses query invalidation for cache updates
    const bookmarkMutation = useContributionBookmarkMutation({
        onError: (error) => {
            console.error('Failed to update bookmark:', error);
            setToastMessage('Failed to update bookmark');
            setToastType('error');
            setToastOpen(true);
        },
    });

    const handleBookmark = () => {
        if (!id) return;
        bookmarkMutation.mutate(parseInt(id));
    };

    // Handle join request submission
    const handleJoinSubmit = async (joinReason: string, roleId: number) => {
        if (!id) return;
        setIsSubmitting(true);
        try {
            await contributionApi.requestCollaboration(parseInt(id), joinReason, roleId);
            setIsModalOpen(false);
            setToastMessage('Your request was sent!');
            setToastType('success');
            setToastOpen(true);
            // Reload project data using refetch
            await refetch();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
            const errorMsg =
                err.response?.data?.errors?.contribution_id?.[0] ||
                err.response?.data?.errors?.role_id?.[0] ||
                err.response?.data?.message ||
                'Failed to send request';
            setToastMessage(errorMsg);
            setToastType('error');
            setToastOpen(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle menu open/close
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    // Handle edit navigation
    const handleEdit = () => {
        handleMenuClose();
        navigate(`/contribution/edit-project/${id}`);
    };

    // Handle delete
    const handleDeleteClick = () => {
        handleMenuClose();
        setIsDeleteModalOpen(true);
    };

    // Handle leave project
    const handleLeaveClick = () => {
        handleMenuClose();
        setIsLeaveModalOpen(true);
    };

    // Handle suggest edit request
    const handleSuggestEditClick = (fieldKey?: string) => {
        handleMenuClose();
        if (fieldKey) {
            setSelectedFieldForEdit(fieldKey);
        }
        setIsEditRequestModalOpen(true);
    };

    // Handle add note for field
    const handleAddNoteClick = (fieldKey: string) => {
        setSelectedFieldForNote(fieldKey);
        setIsNoteModalOpen(true);
    };

    const handleLeaveConfirm = async (leftReason?: string) => {
        if (!id) return;
        leaveProjectMutation.mutate({
            contributionId: parseInt(id),
            leftReason,
            leftAction: 'self',
        });
    };

    // Edit Request handlers
    const handleSubmitEditRequest = async (contentKey: string, newValue: string, oldValue: string, note?: string) => {
        if (!id) return;
        createEditRequestMutation.mutate(
            {
                contributionId: parseInt(id),
                data: {
                    changes: {
                        content_key: contentKey,
                        new_value: newValue,
                        old_value: oldValue,
                    },
                    note: note,
                },
            },
            {
                onSuccess: () => {
                    setToastMessage('Edit request submitted successfully');
                    setToastType('success');
                    setToastOpen(true);
                    setIsEditRequestModalOpen(false);
                    setSelectedFieldForEdit(null);
                },
                onError: (error) => {
                    const errorMsg = error.response?.data?.message || 'Failed to submit edit request';
                    setToastMessage(errorMsg);
                    setToastType('error');
                    setToastOpen(true);
                },
            },
        );
    };

    const handleSubmitNote = async (contributionId: number, type: NoteType, noteText: string, contentKey?: string) => {
        if (editingNote) {
            // Update existing note
            updateNoteMutation.mutate(
                {
                    noteId: editingNote.id,
                    data: { type, note: noteText },
                },
                {
                    onSuccess: () => {
                        setToastMessage('Note updated successfully');
                        setToastType('success');
                        setToastOpen(true);
                        setIsNoteModalOpen(false);
                        setEditingNote(null);
                        setSelectedFieldForNote(null);
                    },
                    onError: (error) => {
                        const errorMsg = error.response?.data?.message || 'Failed to update note';
                        setToastMessage(errorMsg);
                        setToastType('error');
                        setToastOpen(true);
                    },
                },
            );
        } else {
            // Create new note
            createNoteMutation.mutate(
                {
                    contribution_id: contributionId,
                    type,
                    content_key: contentKey || null,
                    note: noteText,
                },
                {
                    onSuccess: () => {
                        setToastMessage('Note added successfully');
                        setToastType('success');
                        setToastOpen(true);
                        setIsNoteModalOpen(false);
                        setSelectedFieldForNote(null);
                    },
                    onError: (error) => {
                        const errorMsg = error.response?.data?.message || 'Failed to add note';
                        setToastMessage(errorMsg);
                        setToastType('error');
                        setToastOpen(true);
                    },
                },
            );
        }
    };

    const handleResolveNote = (noteId: number) => {
        resolveNoteMutation.mutate(noteId, {
            onSuccess: () => {
                setToastMessage('Note resolved successfully');
                setToastType('success');
                setToastOpen(true);
                // Force refetch all field-specific note queries
                if (id) {
                    const contributionId = parseInt(id);
                    // Refetch all field-specific queries
                    queryClient.refetchQueries({ queryKey: ['contributionNotes', contributionId] });
                }
            },
            onError: (error) => {
                const errorMsg = error.response?.data?.message || 'Failed to resolve note';
                setToastMessage(errorMsg);
                setToastType('error');
                setToastOpen(true);
            },
        });
    };

    const handleRejectNote = (noteId: number) => {
        rejectNoteMutation.mutate(noteId, {
            onSuccess: () => {
                setToastMessage('Note rejected successfully');
                setToastType('success');
                setToastOpen(true);
                // Force refetch all field-specific note queries
                if (id) {
                    const contributionId = parseInt(id);
                    // Refetch all field-specific queries
                    queryClient.refetchQueries({ queryKey: ['contributionNotes', contributionId] });
                }
            },
            onError: (error) => {
                const errorMsg = error.response?.data?.message || 'Failed to reject note';
                setToastMessage(errorMsg);
                setToastType('error');
                setToastOpen(true);
            },
        });
    };

    const handleDeleteConfirm = async () => {
        if (!id) return;
        setIsDeleting(true);
        try {
            await contributionApi.delete(parseInt(id));
            setToastMessage('Project deleted successfully');
            setToastType('success');
            setToastOpen(true);
            // Navigate back after a short delay
            setTimeout(() => navigate('/contribution'), 1500);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const errorMsg = err.response?.data?.message || 'Failed to delete project';
            setToastMessage(errorMsg);
            setToastType('error');
            setToastOpen(true);
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    // Show loading spinner while fetching data
    if (isLoading) {
        return (
            <SinglePageLayout title={t('Project Details')}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <CircularProgress sx={{ color: '#1F8505' }} />
                </Box>
            </SinglePageLayout>
        );
    }

    return (
        <SinglePageLayout
            title={t('Project Details')}
            rightElement={
                isOwner || isCollaborator ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton
                            size="small"
                            onClick={handleBookmark}
                            disabled={bookmarkMutation.isPending}
                            sx={{
                                color: project?.is_bookmarked ? '#1F8505' : '#ccc',
                                '&:hover': {
                                    color: project?.is_bookmarked ? '#165d04' : '#1F8505',
                                },
                            }}
                        >
                            {project?.is_bookmarked ? <BookmarkIcon sx={{ fontSize: 20 }} /> : <BookmarkBorderIcon sx={{ fontSize: 20 }} />}
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
                            color: project?.is_bookmarked ? '#1F8505' : '#ccc',
                            '&:hover': {
                                color: project?.is_bookmarked ? '#165d04' : '#1F8505',
                            },
                        }}
                    >
                        {project?.is_bookmarked ? <BookmarkIcon sx={{ fontSize: 20 }} /> : <BookmarkBorderIcon sx={{ fontSize: 20 }} />}
                    </IconButton>
                )
            }
        >
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
                sx={{ width: '100%', borderRadius: 0, mb: 2, objectFit: 'contain', maxHeight: '70vh' }}
            />

            {/* Description */}
            <Box sx={{ p: 2, pb: 1 }}>
                <Typography sx={{ color: '#222', fontSize: 15, mb: 2 }}>{project?.content?.description}</Typography>
            </Box>

            {/* Project Details Sections */}
            <Box sx={{ p: 2, pt: 0 }}>
                {/* Problem */}
                <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0', position: 'relative' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Problem</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {isCollaborator && !isOwner && (
                                <>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleAddNoteClick('problem')}
                                        sx={{
                                            color: '#1F8505',
                                            '&:hover': { bgcolor: 'rgba(31, 133, 5, 0.1)' },
                                        }}
                                    >
                                        <NoteIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleSuggestEditClick('problem')}
                                        sx={{
                                            color: '#1F8505',
                                            '&:hover': { bgcolor: 'rgba(31, 133, 5, 0.1)' },
                                        }}
                                    >
                                        <EditIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </>
                            )}
                        </Box>
                    </Box>
                    <Typography sx={{ color: '#444', fontSize: 14, mb: 1 }}>{project?.content?.problem}</Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            gap: 2,
                            mt: 1,
                        }}
                    >
                        {hasEditRequestsForField('problem') && (
                            <Box
                                component="button"
                                onClick={() => navigate(`/projects/${id}/edit-requests?field=problem`)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    color: '#ff9800',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    '&:hover': { textDecoration: 'underline' },
                                }}
                            >
                                Edit requests
                                {isOwner && getPendingEditRequestCount('problem') > 0 && (
                                    <Badge
                                        badgeContent={getPendingEditRequestCount('problem')}
                                        color="error"
                                        sx={{
                                            '& .MuiBadge-badge': {
                                                bgcolor: '#ff9800',
                                                color: '#fff',
                                                fontSize: 10,
                                                minWidth: 18,
                                                height: 18,
                                            },
                                        }}
                                    />
                                )}
                            </Box>
                        )}
                    </Box>
                    <FieldNotesList
                        notes={problemNotes}
                        isOwner={isOwner}
                        onResolve={handleResolveNote}
                        onReject={handleRejectNote}
                        isResolving={resolveNoteMutation.isPending}
                        isRejecting={rejectNoteMutation.isPending}
                    />
                </Paper>

                {/* Solution */}
                <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0', position: 'relative' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Solution</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {isCollaborator && !isOwner && (
                                <>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleAddNoteClick('solution')}
                                        sx={{
                                            color: '#1F8505',
                                            '&:hover': { bgcolor: 'rgba(31, 133, 5, 0.1)' },
                                        }}
                                    >
                                        <NoteIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleSuggestEditClick('solution')}
                                        sx={{
                                            color: '#1F8505',
                                            '&:hover': { bgcolor: 'rgba(31, 133, 5, 0.1)' },
                                        }}
                                    >
                                        <EditIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </>
                            )}
                        </Box>
                    </Box>
                    <Typography sx={{ color: '#444', fontSize: 14, mb: 1 }}>{project?.content?.solution}</Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            gap: 2,
                            mt: 1,
                        }}
                    >
                        {hasEditRequestsForField('solution') && (
                            <Box
                                component="button"
                                onClick={() => navigate(`/projects/${id}/edit-requests?field=solution`)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    color: '#ff9800',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    '&:hover': { textDecoration: 'underline' },
                                }}
                            >
                                Edit requests
                                {isOwner && getPendingEditRequestCount('solution') > 0 && (
                                    <Badge
                                        badgeContent={getPendingEditRequestCount('solution')}
                                        color="error"
                                        sx={{
                                            '& .MuiBadge-badge': {
                                                bgcolor: '#ff9800',
                                                color: '#fff',
                                                fontSize: 10,
                                                minWidth: 18,
                                                height: 18,
                                            },
                                        }}
                                    />
                                )}
                            </Box>
                        )}
                    </Box>
                    <FieldNotesList
                        notes={solutionNotes}
                        isOwner={isOwner}
                        onResolve={handleResolveNote}
                        onReject={handleRejectNote}
                        isResolving={resolveNoteMutation.isPending}
                        isRejecting={rejectNoteMutation.isPending}
                    />
                </Paper>

                {/* Who Benefits */}
                <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0', position: 'relative' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Who Benefits</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {isCollaborator && !isOwner && (
                                <>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleAddNoteClick('impact')}
                                        sx={{
                                            color: '#1F8505',
                                            '&:hover': { bgcolor: 'rgba(31, 133, 5, 0.1)' },
                                        }}
                                    >
                                        <NoteIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleSuggestEditClick('impact')}
                                        sx={{
                                            color: '#1F8505',
                                            '&:hover': { bgcolor: 'rgba(31, 133, 5, 0.1)' },
                                        }}
                                    >
                                        <EditIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </>
                            )}
                        </Box>
                    </Box>
                    <Typography sx={{ color: '#444', fontSize: 14, mb: 1 }}>{project?.content?.impact}</Typography>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            gap: 2,
                            mt: 1,
                        }}
                    >
                        {hasEditRequestsForField('impact') && (
                            <Box
                                component="button"
                                onClick={() => navigate(`/projects/${id}/edit-requests?field=impact`)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    color: '#ff9800',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    '&:hover': { textDecoration: 'underline' },
                                }}
                            >
                                Edit requests
                                {isOwner && getPendingEditRequestCount('impact') > 0 && (
                                    <Badge
                                        badgeContent={getPendingEditRequestCount('impact')}
                                        color="error"
                                        sx={{
                                            '& .MuiBadge-badge': {
                                                bgcolor: '#ff9800',
                                                color: '#fff',
                                                fontSize: 10,
                                                minWidth: 18,
                                                height: 18,
                                            },
                                        }}
                                    />
                                )}
                            </Box>
                        )}
                    </Box>
                    <FieldNotesList
                        notes={impactNotes}
                        isOwner={isOwner}
                        onResolve={handleResolveNote}
                        onReject={handleRejectNote}
                        isResolving={resolveNoteMutation.isPending}
                        isRejecting={rejectNoteMutation.isPending}
                    />
                </Paper>

                {/* Resources */}
                <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0', position: 'relative' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Resources</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {isCollaborator && !isOwner && (
                                <>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleAddNoteClick('resources')}
                                        sx={{
                                            color: '#1F8505',
                                            '&:hover': { bgcolor: 'rgba(31, 133, 5, 0.1)' },
                                        }}
                                    >
                                        <NoteIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleSuggestEditClick('resources')}
                                        sx={{
                                            color: '#1F8505',
                                            '&:hover': { bgcolor: 'rgba(31, 133, 5, 0.1)' },
                                        }}
                                    >
                                        <EditIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </>
                            )}
                        </Box>
                    </Box>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {(project?.content?.resources ? String(project.content.resources).split(/[,\n]/) : []).map((r, i) => (
                            <li key={i} style={{ color: '#444', fontSize: 14, marginBottom: 2 }}>
                                {r}
                            </li>
                        ))}
                    </ul>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            gap: 2,
                            mt: 1,
                        }}
                    >
                        {hasEditRequestsForField('resources') && (
                            <Box
                                component="button"
                                onClick={() => navigate(`/projects/${id}/edit-requests?field=resources`)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    color: '#ff9800',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    '&:hover': { textDecoration: 'underline' },
                                }}
                            >
                                Edit requests
                                {isOwner && getPendingEditRequestCount('resources') > 0 && (
                                    <Badge
                                        badgeContent={getPendingEditRequestCount('resources')}
                                        color="error"
                                        sx={{
                                            '& .MuiBadge-badge': {
                                                bgcolor: '#ff9800',
                                                color: '#fff',
                                                fontSize: 10,
                                                minWidth: 18,
                                                height: 18,
                                            },
                                        }}
                                    />
                                )}
                            </Box>
                        )}
                    </Box>
                    <FieldNotesList
                        notes={resourcesNotes}
                        isOwner={isOwner}
                        onResolve={handleResolveNote}
                        onReject={handleRejectNote}
                        isResolving={resolveNoteMutation.isPending}
                        isRejecting={rejectNoteMutation.isPending}
                    />
                </Paper>

                {/* References */}
                {(() => {
                    let references: string[] = [];
                    if (project?.content?.references) {
                        try {
                            references =
                                typeof project.content.references === 'string' ? JSON.parse(project.content.references) : project.content.references;
                            if (!Array.isArray(references)) {
                                references = [];
                            }
                        } catch {
                            references = [];
                        }
                    }
                    return references.length > 0 ? (
                        <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0', position: 'relative' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>References</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {isCollaborator && !isOwner && (
                                        <>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleAddNoteClick('references')}
                                                sx={{
                                                    color: '#1F8505',
                                                    '&:hover': { bgcolor: 'rgba(31, 133, 5, 0.1)' },
                                                }}
                                            >
                                                <NoteIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleSuggestEditClick('references')}
                                                sx={{
                                                    color: '#1F8505',
                                                    '&:hover': { bgcolor: 'rgba(31, 133, 5, 0.1)' },
                                                }}
                                            >
                                                <EditIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </>
                                    )}
                                </Box>
                            </Box>
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
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                    gap: 2,
                                    mt: 1,
                                }}
                            >
                                {hasEditRequestsForField('references') && (
                                    <Box
                                        component="button"
                                        onClick={() => navigate(`/projects/${id}/edit-requests?field=references`)}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            border: 'none',
                                            background: 'none',
                                            cursor: 'pointer',
                                            color: '#ff9800',
                                            fontSize: 13,
                                            fontWeight: 600,
                                            '&:hover': { textDecoration: 'underline' },
                                        }}
                                    >
                                        Edit requests
                                        {isOwner && getPendingEditRequestCount('references') > 0 && (
                                            <Badge
                                                badgeContent={getPendingEditRequestCount('references')}
                                                color="error"
                                                sx={{
                                                    '& .MuiBadge-badge': {
                                                        bgcolor: '#ff9800',
                                                        color: '#fff',
                                                        fontSize: 10,
                                                        minWidth: 18,
                                                        height: 18,
                                                    },
                                                }}
                                            />
                                        )}
                                    </Box>
                                )}
                            </Box>
                            <FieldNotesList
                                notes={referencesNotes}
                                isOwner={isOwner}
                                onResolve={handleResolveNote}
                                onReject={handleRejectNote}
                                isResolving={resolveNoteMutation.isPending}
                                isRejecting={rejectNoteMutation.isPending}
                            />
                        </Paper>
                    ) : null;
                })()}

                {/* Attachments */}
                {project?.attachments && project.attachments.length > 0 && (
                    <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Attachments</Typography>
                        <List dense>
                            {project.attachments.map((file, index) => (
                                <ListItem
                                    key={file.id || index}
                                    component="a"
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: '#f5f5f5' },
                                        borderRadius: 1,
                                        mb: 0.5,
                                    }}
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            aria-label="download"
                                            onClick={async (e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (file.id) {
                                                    try {
                                                        await contributionApi.downloadAttachment(file.id, file.name);
                                                        setToastMessage('File downloaded successfully');
                                                        setToastType('success');
                                                        setToastOpen(true);
                                                    } catch (error) {
                                                        const err = error as { response?: { data?: { message?: string } } };
                                                        const errorMsg = err.response?.data?.message || 'Failed to download file';
                                                        setToastMessage(errorMsg);
                                                        setToastType('error');
                                                        setToastOpen(true);
                                                    }
                                                } else {
                                                    // Fallback for legacy attachments without ID
                                                    setToastMessage('This attachment cannot be downloaded');
                                                    setToastType('error');
                                                    setToastOpen(true);
                                                }
                                            }}
                                        >
                                            <DownloadIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: '#e8f5e9', color: '#1F8505', width: 32, height: 32 }}>
                                            {file.name.split('.').pop()?.toUpperCase().substring(0, 2) || 'F'}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={file.name} secondary={file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''} />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                )}
            </Box>

            {/* Team Members Section */}
            <Box sx={{ p: 2, pb: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 17, mb: 2, textAlign: 'center' }}>Team Members</Typography>
                {project?.participants && project.participants.length > 0 ? (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 2 }}>
                        {project.participants.map((member) => (
                            <Box key={member.id} sx={{ textAlign: 'center' }}>
                                <Avatar sx={{ width: 60, height: 60, bgcolor: '#e8f5e9', color: '#1F8505', mx: 'auto', mb: 1 }}>
                                    {member.name[0]?.toUpperCase() || 'U'}
                                </Avatar>
                                <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{member.name}</Typography>
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 3, mb: 2 }}>
                        <Typography sx={{ color: '#888', fontSize: 14 }}>No members yet</Typography>
                    </Box>
                )}
                {/* Action buttons moved to 3-dot menu */}
                {showJoinButton && (
                    <AppButton
                        onClick={() => setIsModalOpen(true)}
                        disabled={!!hasPendingRequest}
                        sx={{
                            bgcolor: hasPendingRequest ? '#ccc' : undefined,
                            borderRadius: '25px',
                            fontSize: 16,
                            py: 1.5,
                            px: 4,
                            width: '100%',
                            position: 'relative',
                            '&:disabled': {
                                bgcolor: '#ccc',
                                color: '#666',
                            },
                        }}
                    >
                        {hasPendingRequest ? 'Your request is pending' : 'Join this team'}
                        {!hasPendingRequest && (
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
                        )}
                    </AppButton>
                )}
            </Box>
            {/* Engagement Metrics */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, p: 2, pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FavoriteBorderIcon sx={{ color: '#666', fontSize: 20 }} />
                    <Typography sx={{ fontSize: 14, color: '#666' }}>{project?.likes_count || 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VisibilityIcon sx={{ color: '#666', fontSize: 20 }} />
                    <Typography sx={{ fontSize: 14, color: '#666' }}>{project?.views_count || 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ChatBubbleOutlineIcon sx={{ color: '#666', fontSize: 20 }} />
                    <Typography sx={{ fontSize: 14, color: '#666' }}>{discussions.length}</Typography>
                </Box>
            </Box>

            {/* Discussion Section */}
            <DiscussionSection contributionId={parseInt(id || '1')} />

            {/* Join Team Modal */}
            <JoinTeamModal
                open={isModalOpen}
                projectTitle={project?.title || ''}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleJoinSubmit}
                isLoading={isSubmitting}
            />

            {/* Success/Error Toast */}
            <Toast open={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />

            {/* Actions Menu - Different items for Owner vs Collaborator */}
            <Menu
                anchorEl={menuAnchorEl}
                open={isMenuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        minWidth: 180,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    },
                }}
            >
                {/* Owner Menu Items */}
                {isOwner && (
                    <>
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
                    </>
                )}

                {/* Collaborator Menu Items */}
                {isCollaborator && !isOwner && (
                    <MenuItem onClick={handleLeaveClick} disabled={leaveProjectMutation.isPending} sx={{ py: 1.5 }}>
                        <ListItemIcon>
                            <DeleteIcon sx={{ color: '#f44336' }} />
                        </ListItemIcon>
                        <Typography sx={{ fontWeight: 500, color: '#f44336' }}>{leaveProjectMutation.isPending ? 'Leaving...' : 'Leave'}</Typography>
                    </MenuItem>
                )}
            </Menu>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={isDeleteModalOpen}
                title="Delete Project"
                message="Are you sure you want to delete this project? This action cannot be undone."
                onConfirm={handleDeleteConfirm}
                onCancel={() => setIsDeleteModalOpen(false)}
                isLoading={isDeleting}
                confirmText="Delete"
                confirmColor="error"
            />

            {/* Leave Project Modal */}
            <LeaveProjectModal
                open={isLeaveModalOpen}
                projectTitle={project?.title || 'this project'}
                onClose={() => setIsLeaveModalOpen(false)}
                onSubmit={handleLeaveConfirm}
                isLoading={leaveProjectMutation.isPending}
            />

            {/* Submit Edit Request Modal */}
            {project && (
                <SubmitEditRequestModal
                    open={isEditRequestModalOpen}
                    currentContent={project.content}
                    onClose={() => {
                        setIsEditRequestModalOpen(false);
                        setSelectedFieldForEdit(null);
                    }}
                    onSubmit={handleSubmitEditRequest}
                    isLoading={createEditRequestMutation.isPending}
                    preselectedField={selectedFieldForEdit || undefined}
                />
            )}

            {/* Add/Edit Note Modal */}
            {id && (
                <AddNoteModal
                    open={isNoteModalOpen}
                    contributionId={parseInt(id)}
                    note={editingNote}
                    contentKey={selectedFieldForNote || undefined}
                    onClose={() => {
                        setIsNoteModalOpen(false);
                        setEditingNote(null);
                        setSelectedFieldForNote(null);
                    }}
                    onSubmit={handleSubmitNote}
                    isLoading={createNoteMutation.isPending || updateNoteMutation.isPending}
                />
            )}
        </SinglePageLayout>
    );
};

export default ProjectDetails;
