import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';

interface JoinTeamModalProps {
    open: boolean;
    projectTitle: string;
    onClose: () => void;
    onSubmit: (reason: string) => Promise<void>;
    isLoading?: boolean;
}

const JoinTeamModal: React.FC<JoinTeamModalProps> = ({ open, projectTitle, onClose, onSubmit, isLoading = false }) => {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        const trimmedReason = reason.trim();

        if (trimmedReason.length < 10) {
            setError('Please provide at least 10 characters explaining why you want to join.');
            return;
        }

        setError('');
        await onSubmit(trimmedReason);
        // Reset form after successful submission
        setReason('');
    };

    const handleClose = () => {
        setReason('');
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
            <DialogTitle sx={{ fontWeight: 700, fontSize: 18, pb: 0.5 }}>{projectTitle}</DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                {/* Why do you want to join? */}
                <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>Why do you want to join?</Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Tell us what about it"
                    value={reason}
                    onChange={(e) => {
                        setReason(e.target.value);
                        if (error) setError('');
                    }}
                    error={!!error}
                    helperText={error}
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
                        borderColor: '#1F8505',
                        color: '#1F8505',
                        minWidth: 120,
                        py: 1,
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                            borderColor: '#165d04',
                            bgcolor: 'rgba(31, 133, 5, 0.04)',
                        },
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    sx={{
                        bgcolor: '#1F8505',
                        color: '#fff',
                        minWidth: 120,
                        py: 1,
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                            bgcolor: '#165d04',
                        },
                        '&:disabled': {
                            bgcolor: '#ccc',
                        },
                    }}
                >
                    {isLoading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={20} color="inherit" />
                            <span>Sending...</span>
                        </Box>
                    ) : (
                        'Send Request'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default JoinTeamModal;
