import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { EditRequest } from '../types/contribution';

interface EditRequestsSectionProps {
    editRequests: EditRequest[];
    isOwner: boolean;
    onApprove: (id: number) => void;
    onReject: (id: number, note?: string) => void;
    isApproving?: boolean;
    isRejecting?: boolean;
}

const EditRequestsSection: React.FC<EditRequestsSectionProps> = ({
    editRequests,
    isOwner,
    onApprove,
    onReject,
    isApproving = false,
    isRejecting = false,
}) => {
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
    const [rejectNote, setRejectNote] = useState('');

    const handleRejectClick = (id: number) => {
        setSelectedRequestId(id);
        setRejectNote('');
        setRejectDialogOpen(true);
    };

    const handleRejectConfirm = () => {
        if (selectedRequestId) {
            onReject(selectedRequestId, rejectNote.trim() || undefined);
            setRejectDialogOpen(false);
            setSelectedRequestId(null);
            setRejectNote('');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
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
            case 'approved':
                return 'Approved';
            case 'rejected':
                return 'Rejected';
            case 'pending':
                return 'Pending';
            default:
                return status;
        }
    };

    const getFieldLabel = (key: string) => {
        const labels: Record<string, string> = {
            problem: 'Problem',
            solution: 'Solution',
            impact: 'Who Benefits',
            description: 'Description',
            resources: 'Resources',
            references: 'References',
        };
        return labels[key] || key;
    };

    if (editRequests.length === 0) {
        return null;
    }

    // Format value for display (handle JSON arrays for references)
    const formatValue = (value: string | null | undefined): string => {
        if (!value) return '(empty)';
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                return JSON.stringify(parsed, null, 2);
            }
        } catch {
            // Not JSON, return as-is
        }
        return value;
    };

    return (
        <>
            <Paper sx={{ mb: 2, borderRadius: 2, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: '#f9f9f9', borderBottom: '1px solid #e0e0e0' }}>
                    <EditIcon sx={{ color: '#1F8505', fontSize: 20 }} />
                    <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Edit Requests ({editRequests.length})</Typography>
                </Box>

                <Box>
                    {editRequests.map((request, index) => (
                        <Accordion
                            key={request.id}
                            defaultExpanded={request.status === 'pending' && isOwner}
                            sx={{
                                boxShadow: 'none',
                                border: 'none',
                                borderBottom: index < editRequests.length - 1 ? '1px solid #e0e0e0' : 'none',
                                '&:before': { display: 'none' },
                                '&.Mui-expanded': { margin: 0 },
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon sx={{ color: '#666' }} />}
                                sx={{
                                    px: 2,
                                    py: 1,
                                    minHeight: 48,
                                    '&.Mui-expanded': { minHeight: 48 },
                                    '& .MuiAccordionSummary-content': {
                                        my: 1,
                                        '&.Mui-expanded': { my: 1 },
                                    },
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                                        <Chip
                                            label={getStatusLabel(request.status)}
                                            size="small"
                                            sx={{
                                                bgcolor: getStatusColor(request.status),
                                                color: '#fff',
                                                fontSize: 10,
                                                height: 20,
                                                fontWeight: 600,
                                            }}
                                        />
                                        <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
                                            {request.user.name} - {getFieldLabel(request.changes.content_key)}
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ color: '#888', fontSize: 11 }}>{new Date(request.created_at).toLocaleDateString()}</Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails sx={{ px: 2, pb: 2, pt: 1, bgcolor: '#fafafa' }}>
                                {request.editor_note && (
                                    <Box sx={{ mb: 1.5, p: 1.5, bgcolor: '#fff', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                                        <Typography sx={{ fontWeight: 600, fontSize: 11, mb: 0.5, color: '#666' }}>Editor Note:</Typography>
                                        <Typography sx={{ fontSize: 12, color: '#444' }}>{request.editor_note}</Typography>
                                    </Box>
                                )}

                                <Box sx={{ mb: 1.5 }}>
                                    <Typography sx={{ fontWeight: 600, fontSize: 11, mb: 0.5, color: '#666' }}>Current Value:</Typography>
                                    <Box
                                        sx={{
                                            p: 1,
                                            bgcolor: '#fff',
                                            borderRadius: 1,
                                            border: '1px solid #e0e0e0',
                                            mb: 1,
                                            maxHeight: 100,
                                            overflow: 'auto',
                                        }}
                                    >
                                        <Typography sx={{ fontSize: 12, color: '#666', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                                            {formatValue(request.changes.old_value)}
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ fontWeight: 600, fontSize: 11, mb: 0.5, color: '#666' }}>Proposed Value:</Typography>
                                    <Box
                                        sx={{
                                            p: 1,
                                            bgcolor: '#e8f5e9',
                                            borderRadius: 1,
                                            border: '1px solid #c8e6c9',
                                            maxHeight: 100,
                                            overflow: 'auto',
                                        }}
                                    >
                                        <Typography sx={{ fontSize: 12, color: '#1F8505', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                                            {formatValue(request.changes.new_value)}
                                        </Typography>
                                    </Box>
                                </Box>

                                {request.review_note && (
                                    <Box sx={{ mb: 1.5, p: 1.5, bgcolor: '#fff', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                                        <Typography sx={{ fontWeight: 600, fontSize: 11, mb: 0.5, color: '#666' }}>Review Note:</Typography>
                                        <Typography sx={{ fontSize: 12, color: '#444' }}>{request.review_note}</Typography>
                                    </Box>
                                )}

                                {request.status === 'pending' && isOwner && (
                                    <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            startIcon={<CheckCircleIcon />}
                                            onClick={() => onApprove(request.id)}
                                            disabled={isApproving || isRejecting}
                                            sx={{
                                                bgcolor: '#4caf50',
                                                textTransform: 'none',
                                                fontSize: 12,
                                                py: 0.5,
                                                '&:hover': { bgcolor: '#45a049' },
                                            }}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<CloseIcon />}
                                            onClick={() => handleRejectClick(request.id)}
                                            disabled={isApproving || isRejecting}
                                            sx={{
                                                borderColor: '#f44336',
                                                color: '#f44336',
                                                textTransform: 'none',
                                                fontSize: 12,
                                                py: 0.5,
                                                '&:hover': { borderColor: '#d32f2f', bgcolor: 'rgba(244, 67, 54, 0.04)' },
                                            }}
                                        >
                                            Reject
                                        </Button>
                                    </Box>
                                )}
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            </Paper>

            {/* Reject Dialog */}
            <Dialog
                open={rejectDialogOpen}
                onClose={() => {
                    setRejectDialogOpen(false);
                    setRejectNote('');
                }}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        p: 1,
                        width: 400,
                    },
                }}
            >
                <DialogTitle sx={{ fontWeight: 700, fontSize: 16 }}>Reject Edit Request</DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: 14, mb: 2, color: '#666' }}>
                        Please provide a reason for rejecting this edit request (optional):
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Enter rejection reason..."
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            },
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2, px: 3 }}>
                    <Button
                        onClick={() => {
                            setRejectDialogOpen(false);
                            setRejectNote('');
                        }}
                        variant="outlined"
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
                        onClick={handleRejectConfirm}
                        variant="contained"
                        disabled={isRejecting}
                        sx={{
                            bgcolor: '#f44336',
                            textTransform: 'none',
                            borderRadius: 2,
                            '&:hover': { bgcolor: '#d32f2f' },
                        }}
                    >
                        Reject
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default EditRequestsSection;
