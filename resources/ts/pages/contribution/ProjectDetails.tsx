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
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
    Avatar,
    Box,
    Button,
    CardMedia,
    Chip,
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
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { contributionApi } from '../../api/contribution';
import ConfirmModal from '../../components/ConfirmModal';
import DiscussionSection from '../../components/DiscussionSection';
import EditRequestsSection from '../../components/EditRequestsSection';
import JoinTeamModal from '../../components/JoinTeamModal';
import LeaveProjectModal from '../../components/LeaveProjectModal';
import SinglePageLayout from '../../components/SinglePageLayout';
import SubmitEditRequestModal from '../../components/SubmitEditRequestModal';
import Toast from '../../components/Toast';
import {
    useApproveEditRequestMutation,
    useCreateEditRequestMutation,
    useEditRequestsQuery,
    useLeaveProjectMutation,
    useRejectEditRequestMutation,
} from '../../hooks';
import useContributionBookmarkMutation from '../../hooks/contribution/useContributionBookmarkMutation';
import { useDiscussions } from '../../hooks/useDiscussions';
import { selectUser } from '../../store/slices/authSlice';
import { Contribution } from '../../types/contribution';
import { downloadFile } from '../../utils/pwa';

const DEFAULT_IMAGE = '/assets/images/idea-sample.png';

const ProjectDetails: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
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
    const [project, setProject] = useState<Contribution | null>(null);
    const currentUser = useSelector(selectUser);

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
            // Reload project data
            if (id) {
                contributionApi.show(parseInt(id)).then((res) => {
                    setProject(res.data);
                });
            }
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
    const { data: editRequestsData } = useEditRequestsQuery(parseInt(id || '0'));
    const editRequests = editRequestsData?.data?.edit_requests || [];

    // Edit Request mutations
    const createEditRequestMutation = useCreateEditRequestMutation();
    const approveEditRequestMutation = useApproveEditRequestMutation();
    const rejectEditRequestMutation = useRejectEditRequestMutation();

    // Bookmark mutation
    const bookmarkMutation = useContributionBookmarkMutation({
        onSuccess: () => {
            if (project) {
                // Manually update local state for immediate feedback if needed,
                // though usually we relying on invalidation or just the optimistic update logic inside hook/cache
                // But here since 'project' is local state, we might need to toggle it if not using query cache for this specific detailed view
                setProject({
                    ...project,
                    is_bookmarked: !project.is_bookmarked,
                });
            }
        },
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
    const handleSuggestEditClick = () => {
        handleMenuClose();
        setIsEditRequestModalOpen(true);
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

    const handleApproveEditRequest = (editRequestId: number) => {
        approveEditRequestMutation.mutate(editRequestId, {
            onSuccess: () => {
                setToastMessage('Edit request approved successfully');
                setToastType('success');
                setToastOpen(true);
                // Reload project to show updated content
                if (id) {
                    contributionApi.show(parseInt(id)).then((res) => {
                        setProject(res.data);
                    });
                }
            },
            onError: (error) => {
                const errorMsg = error.response?.data?.message || 'Failed to approve edit request';
                setToastMessage(errorMsg);
                setToastType('error');
                setToastOpen(true);
            },
        });
    };

    const handleRejectEditRequest = (editRequestId: number, note?: string) => {
        rejectEditRequestMutation.mutate(
            {
                editRequestId,
                data: { note },
            },
            {
                onSuccess: () => {
                    setToastMessage('Edit request rejected');
                    setToastType('success');
                    setToastOpen(true);
                },
                onError: (error) => {
                    const errorMsg = error.response?.data?.message || 'Failed to reject edit request';
                    setToastMessage(errorMsg);
                    setToastType('error');
                    setToastOpen(true);
                },
            },
        );
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

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            try {
                const res = await contributionApi.show(parseInt(id));
                setProject(res.data);
            } catch (err) {
                console.error('Failed to load project:', err);
            }
        };
        load();
    }, [id]);

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

                {/* Edit Requests Section (for owners) */}
                {isOwner && editRequests.length > 0 && (
                    <EditRequestsSection
                        editRequests={editRequests}
                        isOwner={isOwner}
                        onApprove={handleApproveEditRequest}
                        onReject={handleRejectEditRequest}
                        isApproving={approveEditRequestMutation.isPending}
                        isRejecting={rejectEditRequestMutation.isPending}
                    />
                )}

                {/* Edit Requests Section (for collaborators to see their own requests) */}
                {isCollaborator && !isOwner && editRequests.length > 0 && (
                    <EditRequestsSection
                        editRequests={editRequests.filter((req) => req.user.id === currentUser?.id)}
                        isOwner={false}
                        onApprove={() => { }}
                        onReject={() => { }}
                    />
                )}

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
                                                if (file.url) {
                                                    await downloadFile(file.url, file.name);
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
                    <Button
                        variant="contained"
                        onClick={() => setIsModalOpen(true)}
                        disabled={!!hasPendingRequest}
                        sx={{
                            bgcolor: hasPendingRequest ? '#ccc' : '#1F8505',
                            color: '#fff',
                            borderRadius: '25px',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: 16,
                            py: 1.5,
                            px: 4,
                            width: '100%',
                            position: 'relative',
                            '&:hover': {
                                bgcolor: hasPendingRequest ? '#ccc' : '#165d04',
                            },
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
                    </Button>
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
                    <>
                        <MenuItem onClick={handleSuggestEditClick} sx={{ py: 1.5 }}>
                            <ListItemIcon>
                                <EditIcon sx={{ color: '#1F8505' }} />
                            </ListItemIcon>
                            <Typography sx={{ fontWeight: 500 }}>Suggest an Edit</Typography>
                        </MenuItem>
                        <MenuItem onClick={handleLeaveClick} disabled={leaveProjectMutation.isPending} sx={{ py: 1.5 }}>
                            <ListItemIcon>
                                <DeleteIcon sx={{ color: '#f44336' }} />
                            </ListItemIcon>
                            <Typography sx={{ fontWeight: 500, color: '#f44336' }}>
                                {leaveProjectMutation.isPending ? 'Leaving...' : 'Leave'}
                            </Typography>
                        </MenuItem>
                    </>
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
                    onClose={() => setIsEditRequestModalOpen(false)}
                    onSubmit={handleSubmitEditRequest}
                    isLoading={createEditRequestMutation.isPending}
                />
            )}
        </SinglePageLayout>
    );
};

export default ProjectDetails;
