import React from 'react';
import { IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
    to?: string;
    color?: string;
    size?: 'small' | 'medium' | 'large';
    sx?: object;
}

const BackButton: React.FC<BackButtonProps> = ({ to, color = '#1F8505', size = 'small', sx }) => {
    const navigate = useNavigate();
    return (
        <IconButton
            onClick={() => (to ? navigate(to) : navigate(-1))}
            size={size}
            sx={{ mr: 1, ...sx, color: '#1F8505', '&:hover': { color: '#1F8505' }, padding: '20px' }}
        >
            <ArrowBackIosNewIcon fontSize={size} sx={{ color }} />
        </IconButton>
    );
};

export default BackButton; 