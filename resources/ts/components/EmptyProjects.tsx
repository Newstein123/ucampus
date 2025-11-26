import React from 'react';
import { Box, Button, CardMedia, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const IMAGE_SRC = '/assets/images/empty-projects.png';

const EmptyProjects: React.FC = () => {
    const navigate = useNavigate();
    const handleCreate = () => {
        navigate('/contribution/create-project');
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '63vh', // full viewport height
            px: 2,
            pt: 3,
            pb: 2,
        }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                }}
            >
                <CardMedia component="img" image={IMAGE_SRC} alt="empty" sx={{ width: 100, height: 100, opacity: 0.9 }} />
            </Box>

            <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 1 }}>Nothing here. For now.</Typography>
            <Typography sx={{ color: '#777', textAlign: 'center', maxWidth: 280, mb: 2 }}>
                This is where you'll find your projects.
            </Typography>

            <Button variant="contained" onClick={handleCreate} sx={{ bgcolor: '#1F8505', '&:hover': { bgcolor: '#155017' }, textTransform: 'none', borderRadius: 2, px: 3 }}>
                Start a project
            </Button>
        </Box>
    );
};

export default EmptyProjects;
