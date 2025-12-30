import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';

interface LeaveProjectModalProps {
    open: boolean;
    projectTitle: string;
    onClose: () => void;
    onSubmit: (leftReason?: string) => Promise<void>;
    isLoading?: boolean;
}

const LeaveProjectModal: React.FC<LeaveProjectModalProps> = ({ open, projectTitle, onClose, onSubmit, isLoading = false }) => {
    const [leftReason, setLeftReason] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        // Left reason is optional, so we can submit even if empty
        setError('');
        await onSubmit(leftReason.trim() || undefined);
        // Reset form after successful submission
        setLeftReason('');
    };

    const handleClose = () => {
        setLeftReason('');
        setError('');
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            PaperProps={{
                sx: {
                    borderRadius: 5,
                    p: 1,
                    width: 500,
                },
            }}
        >
            <DialogTitle sx={{ fontWeight: 700, fontSize: 18, pb: 0.5 }}>Leave Project</DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                <Typography sx={{ color: '#666', fontSize: 14, mb: 2 }}>
                    Are you sure you want to leave "{projectTitle}"? You will no longer be a participant in this project.
                </Typography>

                {/* Optional reason for leaving */}
                <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>Reason for leaving (optional)</Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Tell us why you're leaving (optional)"
                    value={leftReason}
                    onChange={(e) => {
                        setLeftReason(e.target.value);
                        if (error) setError('');
                    }}
                    error={!!error}
                    helperText={error}
                    disabled={isLoading}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            bgcolor: '#f9f9f9',
                        },
                    }}
                />
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2, px: 3 }}>
                <Button
                    onClick={handleClose}
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
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    variant="contained"
                    color="error"
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
                            <span>Leaving...</span>
                        </Box>
                    ) : (
                        'Leave'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default LeaveProjectModal;
