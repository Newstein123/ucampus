import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, CardMedia, IconButton, Paper, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { contributionApi } from '../api/contribution';
import EmptyProjects from '../components/EmptyProjects';
import Layout from '../components/Layout';
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

const ProjectCard: React.FC<{ id: number; title: string; subtitle?: string; image: string }> = ({ id, title, subtitle, image }) => {
    const navigate = useNavigate();
    const handleNavigate = (projectId: number) => {
        navigate(`/projects/${projectId}`);
    };
    return (
        <Paper
            sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1.5, borderRadius: 3, bgcolor: '#fff', border: '1px solid #e0e0e0', boxShadow: 0 }}
        >
            <CardMedia component="img" image={image} alt={title} sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: '#e8f5e9', mr: 2 }} />
            <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{title}</Typography>
                {subtitle && subtitle !== title && <Typography sx={{ color: '#888', fontSize: 13 }}>{subtitle}</Typography>}
            </Box>
            <IconButton onClick={() => handleNavigate(id)}>
                <ChevronRightIcon sx={{ color: '#bdbdbd' }} />
            </IconButton>
        </Paper>
    );
};

const Projects: React.FC = () => {
    const [ownProjects, setOwnProjects] = useState<Contribution[]>([]);
    const [collaborationProjects, setCollaborationProjects] = useState<CollaborationProject[]>([]);
    const user = useSelector(selectUser);

    useEffect(() => {
        // Fetch own projects (by user_id)
        authApi
            .getProfile()
            .then((profile) => {
                const uid = profile.data.id;
                // Fetch own projects
                contributionApi.list({ user_id: uid, type: 'project', per_page: 20 })
                    .then((res) => setOwnProjects(res.data))
                    .catch(() => setOwnProjects([]));

                // Fetch collaboration projects where user is accepted
                contributionApi.listCollaborations(uid)
                    .then((res) => {
                        // Filter only accepted collaborations
                        const accepted = (res.data?.collaborations || []).filter(
                            (c: { status: string }) => c.status === 'accepted'
                        );
                        setCollaborationProjects(accepted);
                    })
                    .catch(() => setCollaborationProjects([]));
            })
            .catch(() => {
                setOwnProjects([]);
                setCollaborationProjects([]);
            });
    }, [user?.id]);

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
                                    />
                                ))}
                            </>
                        )}

                        {/* Projects you collaborate section */}
                        {collaborationProjects.length > 0 && (
                            <>
                                <Typography sx={{ fontWeight: 700, fontSize: 16, mt: ownProjects.length > 0 ? 4 : 0, mb: 2 }}>Projects you collaborate</Typography>
                                {collaborationProjects.map((c) => (
                                    <ProjectCard
                                        key={c.id}
                                        id={c.contribution.id}
                                        title={c.contribution.title}
                                        subtitle={c.contribution.content?.description || ''}
                                        image={c.contribution.thumbnail_url || DEFAULT_IMAGE}
                                    />
                                ))}
                            </>
                        )}
                    </>
                )}
            </Box>
        </Layout>
    );
};

export default Projects;
