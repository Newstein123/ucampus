import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Avatar, Box, Button, Chip, Collapse, Paper, Typography } from '@mui/material';
import React, { useState } from 'react';
import { ContributionNote } from '../types/contribution';

interface FieldNotesListProps {
    notes: ContributionNote[];
    isOwner: boolean;
    onResolve?: (noteId: number) => void;
    onReject?: (noteId: number) => void;
    isResolving?: boolean;
    isRejecting?: boolean;
}

const FieldNotesList: React.FC<FieldNotesListProps> = ({ notes, isOwner, onResolve, onReject, isResolving = false, isRejecting = false }) => {
    // Auto-expand for owners if there are pending notes, otherwise start collapsed
    const pendingNotesCount = notes.filter((note) => note.status === 'pending').length;
    const [isExpanded, setIsExpanded] = useState(isOwner && pendingNotesCount > 0);

    // Don't show UI if there are no notes
    if (notes.length === 0) {
        return null;
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'idea':
                return <LightbulbIcon sx={{ fontSize: 16, color: '#ff9800' }} />;
            case 'concern':
                return <PriorityHighIcon sx={{ fontSize: 16, color: '#f44336' }} />;
            case 'improvement':
                return <TrendingUpIcon sx={{ fontSize: 16, color: '#4caf50' }} />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'resolved':
                return '#4caf50';
            case 'rejected':
                return '#f44336';
            case 'pending':
                return '#ff9800';
            default:
                return '#666';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'resolved':
                return 'RESOLVED';
            case 'rejected':
                return 'REJECTED';
            case 'pending':
                return 'PENDING';
            default:
                return status.toUpperCase();
        }
    };

    const pendingNotes = notes.filter((note) => note.status === 'pending');
    const resolvedNotes = notes.filter((note) => note.status === 'resolved');
    const rejectedNotes = notes.filter((note) => note.status === 'rejected');

    return (
        <Box sx={{ mt: 2 }}>
            <Box
                component="button"
                onClick={() => setIsExpanded(!isExpanded)}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: '#666',
                    fontSize: 13,
                    fontWeight: 600,
                    p: 0,
                    '&:hover': { color: '#1F8505' },
                }}
            >
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Notes ({notes.length})</Typography>
                {isExpanded ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
            </Box>

            <Collapse in={isExpanded}>
                <Box sx={{ mt: 1 }}>
                    {/* Pending Notes */}
                    {pendingNotes.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            {pendingNotes.map((note) => (
                                <Paper
                                    key={note.id}
                                    sx={{
                                        p: 1.5,
                                        mb: 1,
                                        borderRadius: 1,
                                        border: '1px solid #e0e0e0',
                                        bgcolor: '#fff',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#e8f5e9', color: '#1F8505' }}>
                                            {(note.user.profileName || note.user.username || 'U')[0]?.toUpperCase() || 'U'}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
                                                    {note.user.profileName || note.user.username || 'User'}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>{getTypeIcon(note.type)}</Box>
                                                <Chip
                                                    label={getStatusLabel(note.status)}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: getStatusColor(note.status),
                                                        color: '#fff',
                                                        fontSize: 9,
                                                        height: 18,
                                                        fontWeight: 600,
                                                    }}
                                                />
                                            </Box>
                                            <Typography sx={{ fontSize: 12, color: '#444', mb: 1, whiteSpace: 'pre-wrap' }}>{note.note}</Typography>
                                            <Typography sx={{ fontSize: 10, color: '#888' }}>
                                                {new Date(note.created_at).toLocaleDateString()}
                                            </Typography>
                                            {isOwner && (
                                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        startIcon={<CheckCircleIcon />}
                                                        onClick={() => onResolve?.(note.id)}
                                                        disabled={isResolving || isRejecting}
                                                        sx={{
                                                            bgcolor: '#4caf50',
                                                            textTransform: 'none',
                                                            fontSize: 11,
                                                            py: 0.25,
                                                            px: 1,
                                                            minWidth: 'auto',
                                                            '&:hover': { bgcolor: '#45a049' },
                                                        }}
                                                    >
                                                        Resolve
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<CloseIcon />}
                                                        onClick={() => onReject?.(note.id)}
                                                        disabled={isResolving || isRejecting}
                                                        sx={{
                                                            borderColor: '#f44336',
                                                            color: '#f44336',
                                                            textTransform: 'none',
                                                            fontSize: 11,
                                                            py: 0.25,
                                                            px: 1,
                                                            minWidth: 'auto',
                                                            '&:hover': { borderColor: '#d32f2f', bgcolor: 'rgba(244, 67, 54, 0.04)' },
                                                        }}
                                                    >
                                                        Reject
                                                    </Button>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    )}

                    {/* Resolved Notes */}
                    {resolvedNotes.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            {resolvedNotes.map((note) => (
                                <Paper
                                    key={note.id}
                                    sx={{
                                        p: 1.5,
                                        mb: 1,
                                        borderRadius: 1,
                                        border: '1px solid #e0e0e0',
                                        bgcolor: '#f1f8e9',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#e8f5e9', color: '#1F8505' }}>
                                            {(note.user.profileName || note.user.username || 'U')[0]?.toUpperCase() || 'U'}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
                                                    {note.user.profileName || note.user.username || 'User'}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>{getTypeIcon(note.type)}</Box>
                                                <Chip
                                                    label={getStatusLabel(note.status)}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: getStatusColor(note.status),
                                                        color: '#fff',
                                                        fontSize: 9,
                                                        height: 18,
                                                        fontWeight: 600,
                                                    }}
                                                />
                                            </Box>
                                            <Typography sx={{ fontSize: 12, color: '#444', mb: 1, whiteSpace: 'pre-wrap' }}>{note.note}</Typography>
                                            <Typography sx={{ fontSize: 10, color: '#888' }}>
                                                {new Date(note.created_at).toLocaleDateString()}
                                                {note.resolver && ` • Resolved by ${note.resolver.name}`}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    )}

                    {/* Rejected Notes */}
                    {rejectedNotes.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            {rejectedNotes.map((note) => (
                                <Paper
                                    key={note.id}
                                    sx={{
                                        p: 1.5,
                                        mb: 1,
                                        borderRadius: 1,
                                        border: '1px solid #e0e0e0',
                                        bgcolor: '#ffebee',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#e8f5e9', color: '#1F8505' }}>
                                            {(note.user.profileName || note.user.username || 'U')[0]?.toUpperCase() || 'U'}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
                                                    {note.user.profileName || note.user.username || 'User'}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>{getTypeIcon(note.type)}</Box>
                                                <Chip
                                                    label={getStatusLabel(note.status)}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: getStatusColor(note.status),
                                                        color: '#fff',
                                                        fontSize: 9,
                                                        height: 18,
                                                        fontWeight: 600,
                                                    }}
                                                />
                                            </Box>
                                            <Typography sx={{ fontSize: 12, color: '#444', mb: 1, whiteSpace: 'pre-wrap' }}>{note.note}</Typography>
                                            <Typography sx={{ fontSize: 10, color: '#888' }}>
                                                {new Date(note.created_at).toLocaleDateString()}
                                                {note.resolver && ` • Rejected by ${note.resolver.name}`}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    )}
                </Box>
            </Collapse>
        </Box>
    );
};

export default FieldNotesList;
