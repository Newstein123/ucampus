import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
    Box,
    Button,
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
import { ContributionNote, NoteType } from '../types/contribution';

interface AddNoteModalProps {
    open: boolean;
    contributionId: number;
    note?: ContributionNote | null; // If provided, we're editing
    contentKey?: string; // Field key for field-specific notes
    onClose: () => void;
    onSubmit: (contributionId: number, type: NoteType, note: string, contentKey?: string) => Promise<void>;
    isLoading?: boolean;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({ open, contributionId, note, contentKey, onClose, onSubmit, isLoading = false }) => {
    const [type, setType] = useState<NoteType>('idea');
    const [noteText, setNoteText] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (note) {
            setType(note.type);
            setNoteText(note.note);
        } else {
            setType('idea');
            setNoteText('');
        }
        setError('');
    }, [note, open]);

    const handleSubmit = async () => {
        if (!noteText.trim()) {
            setError('Note text is required');
            return;
        }

        if (noteText.trim().length > 5000) {
            setError('Note must be less than 5000 characters');
            return;
        }

        try {
            await onSubmit(contributionId, type, noteText.trim(), contentKey);
            setNoteText('');
            setType('idea');
            setError('');
        } catch {
            // Error handling is done in parent component
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setNoteText('');
            setType('idea');
            setError('');
            onClose();
        }
    };

    const getTypeIcon = (noteType: NoteType) => {
        switch (noteType) {
            case 'idea':
                return <LightbulbIcon sx={{ fontSize: 20, color: '#ff9800' }} />;
            case 'concern':
                return <PriorityHighIcon sx={{ fontSize: 20, color: '#f44336' }} />;
            case 'improvement':
                return <TrendingUpIcon sx={{ fontSize: 20, color: '#4caf50' }} />;
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    p: 1,
                    width: '90%',
                    maxWidth: 500,
                },
            }}
        >
            <DialogTitle sx={{ fontWeight: 700, fontSize: 18, pb: 1 }}>{note ? 'Edit Note' : 'Add Note'}</DialogTitle>
            <DialogContent>
                <FormControl fullWidth sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f9f9f9' } }}>
                    <InputLabel>Note Type</InputLabel>
                    <Select
                        value={type}
                        label="Note Type"
                        onChange={(e) => {
                            setType(e.target.value as NoteType);
                            if (error) setError('');
                        }}
                        disabled={isLoading}
                        startAdornment={getTypeIcon(type)}
                    >
                        <MenuItem value="idea">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LightbulbIcon sx={{ fontSize: 18, color: '#ff9800' }} />
                                <Typography>Idea</Typography>
                            </Box>
                        </MenuItem>
                        <MenuItem value="concern">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PriorityHighIcon sx={{ fontSize: 18, color: '#f44336' }} />
                                <Typography>Concern</Typography>
                            </Box>
                        </MenuItem>
                        <MenuItem value="improvement">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TrendingUpIcon sx={{ fontSize: 18, color: '#4caf50' }} />
                                <Typography>Improvement</Typography>
                            </Box>
                        </MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    fullWidth
                    multiline
                    rows={6}
                    placeholder="Write your note here..."
                    value={noteText}
                    onChange={(e) => {
                        setNoteText(e.target.value);
                        if (error) setError('');
                    }}
                    disabled={isLoading}
                    error={!!error}
                    helperText={error || `${noteText.length}/5000 characters`}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
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
                        textTransform: 'none',
                        borderRadius: 2,
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={isLoading || !noteText.trim()}
                    sx={{
                        bgcolor: '#1F8505',
                        textTransform: 'none',
                        borderRadius: 2,
                        '&:hover': { bgcolor: '#165d04' },
                        '&:disabled': { bgcolor: '#ccc' },
                    }}
                >
                    {isLoading ? 'Saving...' : note ? 'Update Note' : 'Add Note'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddNoteModal;
