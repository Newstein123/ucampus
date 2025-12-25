import BookmarkIcon from '@mui/icons-material/Bookmark';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
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
import JoinTeamModal from '../../components/JoinTeamModal';
import SinglePageLayout from '../../components/SinglePageLayout';
import Toast from '../../components/Toast';
import { useDiscussions } from '../../hooks/useDiscussions';
import { selectUser } from '../../store/slices/authSlice';
import { Contribution } from '../../types/contribution';

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

    // Use the discussions hook
    const { discussions } = useDiscussions({
        contributionId: parseInt(id || '1'),
        perPage: 10,
        page: 1,
    });

    // Check if current user is the project owner
    const isOwner = currentUser?.id === project?.user?.id;
    // Check if user can join: must be logged in, project allows collaboration, and not the owner
    const canJoin = currentUser && project?.allow_collab && !isOwner;

    // Handle join request submission
    const handleJoinSubmit = async (reason: string) => {
        if (!id) return;
        setIsSubmitting(true);
        try {
            await contributionApi.requestCollaboration(parseInt(id), reason);
            setIsModalOpen(false);
            setToastMessage('Your request was sent!');
            setToastType('success');
            setToastOpen(true);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
            const errorMsg = err.response?.data?.errors?.contribution_id?.[0] || err.response?.data?.message || 'Failed to send request';
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
                isOwner ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <BookmarkIcon sx={{ color: '#ccc', fontSize: 20, cursor: 'pointer' }} />
                        <IconButton size="small" onClick={handleMenuOpen} sx={{ color: '#666' }}>
                            <MoreVertIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Box>
                ) : (
                    <BookmarkIcon sx={{ color: '#ccc', fontSize: 20, cursor: 'pointer' }} />
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
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (file.url) {
                                                    window.open(file.url, '_blank');
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
                {/* Check if user is already a team member */}
                {currentUser && project?.participants?.some((member) => member.user_id === currentUser.id) ? (
                    <Button
                        variant="outlined"
                        onClick={() => {
                            // Leave functionality - API not implemented yet
                            setToastMessage('Leave team functionality coming soon');
                            setToastType('error');
                            setToastOpen(true);
                        }}
                        sx={{
                            borderColor: '#f44336',
                            color: '#f44336',
                            borderRadius: '25px',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: 16,
                            py: 1.5,
                            px: 4,
                            width: '100%',
                            '&:hover': {
                                borderColor: '#d32f2f',
                                bgcolor: '#fff5f5',
                            },
                        }}
                    >
                        Leave
                    </Button>
                ) : (
                    canJoin && (
                        <Button
                            variant="contained"
                            onClick={() => setIsModalOpen(true)}
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
                                '&:hover': {
                                    bgcolor: '#165d04',
                                },
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
                    )
                )}
            </Box>
            {/* Engagement Metrics */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, p: 2, pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FavoriteBorderIcon sx={{ color: '#666', fontSize: 20 }} />
                    <Typography sx={{ fontSize: 14, color: '#666' }}>{10}</Typography>
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

            {/* Owner Actions Menu */}
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
                        minWidth: 150,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    },
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
                title="Delete Project"
                message="Are you sure you want to delete this project? This action cannot be undone."
                onConfirm={handleDeleteConfirm}
                onCancel={() => setIsDeleteModalOpen(false)}
                isLoading={isDeleting}
                confirmText="Delete"
                confirmColor="error"
            />
        </SinglePageLayout>
    );
};

export default ProjectDetails;
