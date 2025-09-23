import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, CardMedia, IconButton, Paper, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { contributionApi } from '../api/contribution';
import { Contribution } from '../types/contribution';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/slices/authSlice';

const DEFAULT_IMAGE = '/assets/images/idea-sample.png';



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
                {subtitle && subtitle !== title && (
                    <Typography sx={{ color: '#888', fontSize: 13 }}>{subtitle}</Typography>
                )}
            </Box>
            <IconButton onClick={() => handleNavigate(id)}>
                <ChevronRightIcon sx={{ color: '#bdbdbd' }} />
            </IconButton>
        </Paper>
    );
};

const Projects: React.FC = () => {
    const [ownProjects, setOwnProjects] = useState<Contribution[]>([]);
    const user = useSelector(selectUser);

    useEffect(() => {
        // Fetch own projects (type=project)
        contributionApi
            .list({ owner: 'me', type: 'project', per_page: 20 })
            .then((res) => setOwnProjects(res.data))
            .catch(() => setOwnProjects([]));

    }, [user?.id]);

    return (
        <Layout>
            <Box sx={{ px: 2, pt: 3, pb: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 18, textAlign: 'center', mb: 3 }}>Projects</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Your own projects</Typography>
                {ownProjects.length === 0 ? (
                    <Typography sx={{ color: '#777', mb: 2 }}>No projects yet.</Typography>
                ) : (
                    ownProjects.map((p) => (
                        <ProjectCard key={p.id} id={p.id} title={p.title} subtitle={p.content?.description || ''} image={p.thumbnail_url || DEFAULT_IMAGE} />
                    ))
                )}
                {/* Collaboration section removed per requirement to only show own projects */}
            </Box>
        </Layout>
    );
};

export default Projects;
