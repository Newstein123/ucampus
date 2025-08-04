import { Box, CircularProgress, Typography } from '@mui/material';
import React from 'react';

interface PWALoadingProps {
    message?: string;
}

const PWALoading: React.FC<PWALoadingProps> = ({ message = 'Loading...' }) => {
    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#f7fafd',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                gap: 2,
            }}
        >
            <CircularProgress
                size={40}
                sx={{
                    color: '#1F8505',
                    '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                    },
                }}
            />
            <Typography
                variant="body1"
                sx={{
                    color: '#666',
                    fontSize: '16px',
                    fontWeight: 500,
                }}
            >
                {message}
            </Typography>
        </Box>
    );
};

export default PWALoading;
