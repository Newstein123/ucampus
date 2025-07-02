import React from 'react';
import {
    Box, Typography, Card, CardContent, CardMedia, IconButton, Paper
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

const ownProjects = [
    {
        title: 'U Campus Platform',
        subtitle: 'A digital hub for Myanmar youth',
        image: '/assets/images/idea-sample.png',
    },
    {
        title: 'Green Future',
        subtitle: 'Sustainability awareness campaign',
        image: '/assets/images/idea-sample.png',
    },
];

const collabProjects = [
    {
        title: 'Tech for All',
        subtitle: 'Open source learning tools',
        image: '/assets/images/idea-sample.png',
    },
    {
        title: 'Art Connect',
        subtitle: 'Connecting artists and communities',
        image: '/assets/images/idea-sample.png',
    },
    {
        title: 'Health Bridge',
        subtitle: 'Community health initiative',
        image: '/assets/images/idea-sample.png',
    },
];

const ProjectCard: React.FC<{ title: string; subtitle: string; image: string }> = ({ title, subtitle, image }) => {
    const navigate = useNavigate();
    return (
        <Paper sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1.5, borderRadius: 3, bgcolor: '#fff', border: '1px solid #e0e0e0', boxShadow: 0 }}>
            <CardMedia
                component="img"
                image={image}
                alt={title}
                sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: '#e8f5e9', mr: 2 }}
            />
            <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{title}</Typography>
                <Typography sx={{ color: '#888', fontSize: 13 }}>{subtitle}</Typography>
            </Box>
            <IconButton onClick={() => navigate(`/projects/${title.toLowerCase().replace(/\s+/g, '-')}`)}>
                <ChevronRightIcon sx={{ color: '#bdbdbd' }} />
            </IconButton>
        </Paper>
    );
};

const Projects: React.FC = () => {
    return (
        <Layout>
            <Box sx={{ px: 2, pt: 3, pb: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 18, textAlign: 'center', mb: 3 }}>Projects</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Your own projects</Typography>
                {ownProjects.map((p, idx) => (
                    <ProjectCard key={idx} title={p.title} subtitle={p.subtitle} image={p.image} />
                ))}
                <Typography sx={{ fontWeight: 700, fontSize: 15, mt: 3, mb: 1 }}>Projects you collaborate</Typography>
                {collabProjects.map((p, idx) => (
                    <ProjectCard key={idx} title={p.title} subtitle={p.subtitle} image={p.image} />
                ))}
            </Box>
        </Layout>
    );
};

export default Projects; 