import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, CardMedia, CircularProgress, ListItemIcon, Menu, MenuItem, Paper, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { contributionApi } from '../api/contribution';
import ConfirmModal from '../components/ConfirmModal';
import EmptyProjects from '../components/EmptyProjects';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import { selectUser } from '../store/slices/authSlice';
import { Contribution } from '../types/contribution';

const DEFAULT_IMAGE = '/assets/images/idea-sample.png';

interface CollaborationProject {
    id: number;
    contribution_id: number;
    contribution: {
        id: number;
        title: string;
        thumbnail_url?: string;
        content?: {
            description?: string;
        };
    };
}

interface ProjectCardProps {
    id: number;
    title: string;
    subtitle?: string;
    image: string;
    showMenu?: boolean;
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ id, title, subtitle, image, showMenu = false, onEdit, onDelete }) => {
    const navigate = useNavigate();
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(menuAnchorEl);

    const handleNavigate = () => {
        navigate(`/projects/${id}`);
    };

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
        onEdit?.(id);
    };

    const handleDelete = (event: React.MouseEvent) => {
        event.stopPropagation();
        handleMenuClose();
        onDelete?.(id);
    };

    return (
        <>
            <Paper
                onClick={handleNavigate}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    p: 1.5,
                    borderRadius: 3,
                    bgcolor: '#fff',
                    border: '1px solid #e0e0e0',
                    boxShadow: 0,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f9f9f9' },
                }}
            >
                <CardMedia component="img" image={image} alt={title} sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: '#e8f5e9', mr: 2 }} />
                <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{title}</Typography>
                    {subtitle && subtitle !== title && <Typography sx={{ color: '#888', fontSize: 13 }}>{subtitle}</Typography>}
                </Box>
                {showMenu && (
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
                )}
            </Paper>

            {/* Menu */}
            <Menu
                anchorEl={menuAnchorEl}
                open={isMenuOpen}
                onClose={handleMenuClose}
                onClick={(e) => e.stopPropagation()}
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
                        minWidth: 120,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    },
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

const Projects: React.FC = () => {
    const [ownProjects, setOwnProjects] = useState<Contribution[]>([]);
    const [collaborationProjects, setCollaborationProjects] = useState<CollaborationProject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const user = useSelector(selectUser);

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Toast state
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const navigate = useNavigate();

    useEffect(() => {
        setIsLoading(true);
        // Fetch user profile then both own projects and collaborations
        authApi
            .getProfile()
            .then((profile) => {
                const uid = profile.data.id;
                const ownPromise = contributionApi.list({ user_id: uid, type: 'project', per_page: 20 });
                const collabPromise = contributionApi.listCollaborations(uid);

                Promise.all([ownPromise, collabPromise])
                    .then(([ownRes, collabRes]) => {
                        setOwnProjects(ownRes.data);
                        const accepted = (collabRes.data?.collaborations || []).filter((c: { status: string }) => c.status === 'accepted');
                        setCollaborationProjects(accepted);
                    })
                    .catch(() => {
                        setOwnProjects([]);
                        setCollaborationProjects([]);
                    })
                    .finally(() => setIsLoading(false));
            })
            .catch(() => {
                setOwnProjects([]);
                setCollaborationProjects([]);
                setIsLoading(false);
            });
    }, [user?.id]);

    const handleEdit = (id: number) => {
        navigate(`/contribution/edit-project/${id}`);
    };

    const handleDeleteClick = (id: number) => {
        setProjectToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!projectToDelete) return;
        setIsDeleting(true);
        try {
            await contributionApi.delete(projectToDelete);
            // Remove from list
            setOwnProjects((prev) => prev.filter((p) => p.id !== projectToDelete));
            setToastMessage('Project deleted successfully');
            setToastType('success');
            setToastOpen(true);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const errorMsg = err.response?.data?.message || 'Failed to delete project';
            setToastMessage(errorMsg);
            setToastType('error');
            setToastOpen(true);
        } finally {
            setIsDeleting(false);
            setDeleteModalOpen(false);
            setProjectToDelete(null);
        }
    };

    if (isLoading) {
        return (
            <Layout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress sx={{ color: '#1F8505' }} />
                </Box>
            </Layout>
        );
    }

    return (
        <Layout>
            <Typography sx={{ fontWeight: 700, fontSize: 18, textAlign: 'center', mb: 3 }}>Projects</Typography>
            <Box sx={{ pt: 3, pb: 2, alignItems: 'center', justifyContent: 'center' }}>
                {/* Show empty state when no projects at all */}
                {ownProjects.length === 0 && collaborationProjects.length === 0 ? (
                    <EmptyProjects />
                ) : (
                    <>
                        {/* Your own projects section */}
                        {ownProjects.length > 0 && (
                            <>
                                <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 2 }}>Your own projects</Typography>
                                {ownProjects.map((p) => (
                                    <ProjectCard
                                        key={p.id}
                                        id={p.id}
                                        title={p.title}
                                        subtitle={p.content?.description || ''}
                                        image={p.thumbnail_url || DEFAULT_IMAGE}
                                        showMenu={true}
                                        onEdit={handleEdit}
                                        onDelete={handleDeleteClick}
                                    />
                                ))}
                            </>
                        )}

                        {/* Projects you collaborate section */}
                        {collaborationProjects.length > 0 && (
                            <>
                                <Typography sx={{ fontWeight: 700, fontSize: 16, mt: ownProjects.length > 0 ? 4 : 0, mb: 2 }}>
                                    Projects you collaborate
                                </Typography>
                                {collaborationProjects.map((c) => (
                                    <ProjectCard
                                        key={c.id}
                                        id={c.contribution.id}
                                        title={c.contribution.title}
                                        subtitle={c.contribution.content?.description || ''}
                                        image={c.contribution.thumbnail_url || DEFAULT_IMAGE}
                                        showMenu={false}
                                    />
                                ))}
                            </>
                        )}
                    </>
                )}
            </Box>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={deleteModalOpen}
                title="Delete Project"
                message="Are you sure you want to delete this project? This action cannot be undone."
                onConfirm={handleDeleteConfirm}
                onCancel={() => {
                    setDeleteModalOpen(false);
                    setProjectToDelete(null);
                }}
                isLoading={isDeleting}
                confirmText="Delete"
                confirmColor="error"
            />

            {/* Toast */}
            <Toast open={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
        </Layout>
    );
};

export default Projects;
