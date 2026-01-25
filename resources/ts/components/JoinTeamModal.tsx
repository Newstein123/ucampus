import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { contributionApi } from '../api/contribution';

interface ContributionRole {
    id: number;
    key: string;
    label: string;
    is_active: boolean;
}

interface JoinTeamModalProps {
    open: boolean;
    projectTitle: string;
    onClose: () => void;
    onSubmit: (joinReason: string, roleId: number) => Promise<void>;
    isLoading?: boolean;
}

const JoinTeamModal: React.FC<JoinTeamModalProps> = ({ open, projectTitle, onClose, onSubmit, isLoading = false }) => {
    const [reason, setReason] = useState('');
    const [roleId, setRoleId] = useState<number | ''>('');
    const [roles, setRoles] = useState<ContributionRole[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            loadRoles();
        }
    }, [open]);
    useEffect(() => {
        console.log('roles:', roles);
    }, [roles]);

    const loadRoles = async () => {
        setLoadingRoles(true);
        try {
            const response = await contributionApi.getContributionRoles();
            setRoles(response.data || []);
        } catch (error) {
            console.error('Failed to load roles:', error);
        } finally {
            setLoadingRoles(false);
        }
    };

    const handleSubmit = async () => {
        const trimmedReason = reason.trim();

        if (trimmedReason.length < 10) {
            setError('Please provide at least 10 characters explaining why you want to join.');
            return;
        }

        if (!roleId) {
            setError('Please select a role.');
            return;
        }

        setError('');
        await onSubmit(trimmedReason, roleId as number);
        // Reset form after successful submission
        setReason('');
        setRoleId('');
    };

    const handleClose = () => {
        setReason('');
        setRoleId('');
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
                {/* Role Selection */}
                <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>Select Role</Typography>
                <FormControl
                    fullWidth
                    sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            bgcolor: '#f9f9f9',
                        },
                    }}
                >
                    <InputLabel>Role</InputLabel>
                    <Select
                        value={roleId}
                        label="Role"
                        onChange={(e) => {
                            setRoleId(e.target.value as number);
                            if (error) setError('');
                        }}
                        disabled={loadingRoles || isLoading}
                    >
                        {loadingRoles ? (
                            <MenuItem disabled>Loading roles...</MenuItem>
                        ) : (
                            roles.map((role) => (
                                <MenuItem key={role.id} value={role.id}>
                                    {role.label}
                                </MenuItem>
                            ))
                        )}
                    </Select>
                </FormControl>

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
