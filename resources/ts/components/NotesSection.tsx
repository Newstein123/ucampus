import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Avatar,
    Box,
    Button,
    CircularProgress,
    IconButton,
    ListItemIcon,
    Menu,
    MenuItem,
    Paper,
    Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { ContributionNote, NoteType } from '../types/contribution';

interface NotesSectionProps {
    contributionId: number;
    notes: ContributionNote[];
    isLoading?: boolean;
    currentUserId?: number;
    onEdit: (note: ContributionNote) => void;
    onDelete: (noteId: number) => void;
    onAddNote: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NotesSection: React.FC<NotesSectionProps> = ({ contributionId, notes, isLoading = false, currentUserId, onEdit, onDelete, onAddNote }) => {
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedNote, setSelectedNote] = useState<ContributionNote | null>(null);
    const isMenuOpen = Boolean(menuAnchorEl);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, note: ContributionNote) => {
        event.stopPropagation();
        setMenuAnchorEl(event.currentTarget);
        setSelectedNote(note);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setSelectedNote(null);
    };

    const handleEdit = () => {
        if (selectedNote) {
            onEdit(selectedNote);
            handleMenuClose();
        }
    };

    const handleDelete = () => {
        if (selectedNote) {
            onDelete(selectedNote.id);
            handleMenuClose();
        }
    };

    const getTypeIcon = (type: NoteType) => {
        switch (type) {
            case 'idea':
                return <LightbulbIcon sx={{ fontSize: 18, color: '#ff9800' }} />;
            case 'concern':
                return <PriorityHighIcon sx={{ fontSize: 18, color: '#f44336' }} />;
            case 'improvement':
                return <TrendingUpIcon sx={{ fontSize: 18, color: '#4caf50' }} />;
            default:
                return null;
        }
    };

    const getTypeColor = (type: NoteType) => {
        switch (type) {
            case 'idea':
                return '#fff3e0';
            case 'concern':
                return '#ffebee';
            case 'improvement':
                return '#e8f5e9';
            default:
                return '#f5f5f5';
        }
    };

    const getTypeLabel = (type: NoteType) => {
        switch (type) {
            case 'idea':
                return 'Idea';
            case 'concern':
                return 'Concern';
            case 'improvement':
                return 'Improvement';
            default:
                return type;
        }
    };

    // Group notes by type
    const groupedNotes = notes.reduce(
        (acc, note) => {
            if (!acc[note.type]) {
                acc[note.type] = [];
            }
            acc[note.type].push(note);
            return acc;
        },
        {} as Record<NoteType, ContributionNote[]>,
    );

    const noteTypes: NoteType[] = ['idea', 'concern', 'improvement'];

    if (isLoading) {
        return (
            <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={24} sx={{ color: '#1F8505' }} />
                </Box>
            </Paper>
        );
    }

    return (
        <>
            <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EditIcon sx={{ color: '#1F8505' }} />
                        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Collaborator Notes ({notes.length})</Typography>
                    </Box>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={onAddNote}
                        sx={{
                            bgcolor: '#1F8505',
                            textTransform: 'none',
                            borderRadius: 2,
                            '&:hover': { bgcolor: '#165d04' },
                        }}
                    >
                        Add Note
                    </Button>
                </Box>

                {notes.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography sx={{ color: '#888', fontSize: 14 }}>No notes yet. Be the first to add one!</Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {noteTypes.map((type) => {
                            const typeNotes = groupedNotes[type] || [];
                            if (typeNotes.length === 0) return null;

                            return (
                                <Accordion
                                    key={type}
                                    defaultExpanded={typeNotes.length > 0}
                                    sx={{
                                        bgcolor: getTypeColor(type),
                                        border: '1px solid #e0e0e0',
                                        borderRadius: 2,
                                        '&.Mui-expanded': {
                                            margin: '8px 0',
                                        },
                                        '&:before': {
                                            display: 'none',
                                        },
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        sx={{
                                            minHeight: 48,
                                            '& .MuiAccordionSummary-content': {
                                                margin: '12px 0',
                                            },
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                            {getTypeIcon(type)}
                                            <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                                                {getTypeLabel(type)} ({typeNotes.length})
                                            </Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ borderTop: '1px solid #e0e0e0', pt: 1, pb: 2 }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {typeNotes.map((note) => (
                                                <Paper
                                                    key={note.id}
                                                    sx={{
                                                        p: 1.5,
                                                        bgcolor: '#fff',
                                                        borderRadius: 2,
                                                        border: '1px solid #e0e0e0',
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                                        <Avatar
                                                            sx={{
                                                                bgcolor: '#48b74d',
                                                                width: 32,
                                                                height: 32,
                                                                fontSize: 14,
                                                            }}
                                                        >
                                                            {note.user.profileName?.[0] || note.user.username?.[0] || 'U'}
                                                        </Avatar>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Box
                                                                sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between',
                                                                    mb: 0.5,
                                                                }}
                                                            >
                                                                <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
                                                                    {note.user.profileName || note.user.username}
                                                                </Typography>
                                                                {currentUserId === note.user.id && (
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={(e) => handleMenuClick(e, note)}
                                                                        sx={{ p: 0.5 }}
                                                                    >
                                                                        <MoreVertIcon sx={{ fontSize: 18 }} />
                                                                    </IconButton>
                                                                )}
                                                            </Box>
                                                            <Typography sx={{ fontSize: 13, color: '#444', mb: 1, whiteSpace: 'pre-wrap' }}>
                                                                {note.note}
                                                            </Typography>
                                                            <Typography sx={{ fontSize: 11, color: '#888' }}>
                                                                {new Date(note.created_at).toLocaleDateString()}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Paper>
                                            ))}
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>
                            );
                        })}
                    </Box>
                )}
            </Paper>

            {/* Edit/Delete Menu */}
            <Menu anchorEl={menuAnchorEl} open={isMenuOpen} onClose={handleMenuClose}>
                <MenuItem onClick={handleEdit} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                        <EditIcon sx={{ color: '#1F8505', fontSize: 20 }} />
                    </ListItemIcon>
                    <Typography sx={{ fontWeight: 500 }}>Edit</Typography>
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                        <DeleteIcon sx={{ color: '#f44336', fontSize: 20 }} />
                    </ListItemIcon>
                    <Typography sx={{ fontWeight: 500, color: '#f44336' }}>Delete</Typography>
                </MenuItem>
            </Menu>
        </>
    );
};

export default NotesSection;
