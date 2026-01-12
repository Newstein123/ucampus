import { Button, ButtonProps } from '@mui/material';
import React from 'react';

interface AppButtonProps extends ButtonProps {
    children: React.ReactNode;
}

const AppButton: React.FC<AppButtonProps> = ({ children, sx, ...props }) => {
    return (
        <Button
            variant="contained" // Default to contained, can be overridden
            sx={{
                bgcolor: '#198d0f',
                color: '#fff',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: 18,
                py: 1.5,
                '&:hover': { bgcolor: '#156c0c' },
                ...sx, // Allow overriding styles
            }}
            {...props}
        >
            {children}
        </Button>
    );
};

export default AppButton;
