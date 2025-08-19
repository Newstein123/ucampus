import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { IconButton } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
    to?: string;
    color?: string;
    size?: 'small' | 'medium' | 'large';
    sx?: object;
    onClick?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ to, color = '#1F8505', size = 'small', sx, onClick }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (to) {
            navigate(to);
        } else {
            navigate(-1);
        }
    };

    return (
        <IconButton
            onClick={handleClick}
            size={size}
            sx={{ mr: 1, ...sx, color: '#1F8505', '&:hover': { color: '#1F8505' }, padding: '20px' }}
        >
            <ArrowBackIosNewIcon fontSize={size} sx={{ color }} />
        </IconButton>
    );
};

export default BackButton;
