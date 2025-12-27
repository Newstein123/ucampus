import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import React from 'react';

interface ConfirmModalProps {
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: 'error' | 'primary' | 'success' | 'warning';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    open,
    title,
    message,
    onConfirm,
    onCancel,
    isLoading = false,
    confirmText = 'Delete',
    cancelText = 'Cancel',
    confirmColor = 'error',
}) => {
    return (
        <Dialog
            open={open}
            onClose={onCancel}
            PaperProps={{
                sx: {
                    borderRadius: 5,
                    p: 1,
                    width: 400,
                },
            }}
        >
            <DialogTitle sx={{ fontWeight: 700, fontSize: 18, pb: 0.5 }}>{title}</DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                <Typography sx={{ color: '#666', fontSize: 14 }}>{message}</Typography>
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2, px: 3 }}>
                <Button
                    onClick={onCancel}
                    variant="outlined"
                    disabled={isLoading}
                    sx={{
                        borderColor: '#888',
                        color: '#666',
                        minWidth: 120,
                        py: 1,
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                            borderColor: '#666',
                            bgcolor: 'rgba(0, 0, 0, 0.04)',
                        },
                    }}
                >
                    {cancelText}
                </Button>
                <Button
                    onClick={onConfirm}
                    disabled={isLoading}
                    variant="contained"
                    color={confirmColor}
                    sx={{
                        minWidth: 120,
                        py: 1,
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:disabled': {
                            bgcolor: '#ccc',
                        },
                    }}
                >
                    {isLoading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={20} color="inherit" />
                            <span>Processing...</span>
                        </Box>
                    ) : (
                        confirmText
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmModal;
