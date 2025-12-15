import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import { Alert, IconButton, Snackbar } from '@mui/material';
import React from 'react';

interface ToastProps {
    open: boolean;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    onClose: () => void;
    autoHideDuration?: number;
}

const Toast: React.FC<ToastProps> = ({ open, message, type = 'success', onClose, autoHideDuration = 3000 }) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={autoHideDuration}
            onClose={onClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            sx={{ top: 20 }}
        >
            <Alert
                onClose={onClose}
                severity={type}
                icon={type === 'success' ? <CheckCircleIcon sx={{ color: '#1F8505' }} /> : undefined}
                action={
                    <IconButton size="small" aria-label="close" color="inherit" onClick={onClose}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
                sx={{
                    width: '100%',
                    bgcolor: type === 'success' ? '#e8f5e9' : undefined,
                    color: type === 'success' ? '#1F8505' : undefined,
                    border: type === 'success' ? '1px solid #c8e6c9' : undefined,
                    borderRadius: 2,
                    fontWeight: 500,
                    '& .MuiAlert-icon': {
                        color: '#1F8505',
                    },
                }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
};

export default Toast;
