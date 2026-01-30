import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Avatar,
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
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { contributionApi } from '../../api/contribution';
import SinglePageLayout from '../../components/SinglePageLayout';
import Toast from '../../components/Toast';
import { useApproveEditRequestMutation, useEditRequestsQuery, useRejectEditRequestMutation } from '../../hooks';
import { selectUser } from '../../store/slices/authSlice';
import { Contribution, EditRequest } from '../../types/contribution';

const FIELD_LABELS: Record<string, string> = {
    problem: 'Problem',
    solution: 'Solution',
    impact: 'Who Benefits',
    description: 'Description',
    resources: 'Resources',
    references: 'References',
};

const EditRequestsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const contentKey = searchParams.get('field') || '';
    const navigate = useNavigate();
    const currentUser = useSelector(selectUser);
    const [project, setProject] = useState<Contribution | null>(null);

    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
    const [rejectNote, setRejectNote] = useState('');
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const { data: editRequestsData, refetch } = useEditRequestsQuery(parseInt(id || '0'), undefined, contentKey);
    const editRequests = editRequestsData?.data?.edit_requests || [];

    // Load project to check if user is owner
    useEffect(() => {
        const load = async () => {
            if (!id) return;
            try {
                const res = await contributionApi.show(parseInt(id));
                setProject(res.data);
            } catch (err) {
                console.error('Failed to load project:', err);
            }
        };
        load();
    }, [id]);

    // Check if current user is the owner
    const isOwner = currentUser?.id === project?.user?.id;

    // Separate pending and history requests
    // For owners: show all pending requests
    // For collaborators: show only history (no pending section)
    const pendingRequests = isOwner ? editRequests.filter((req) => req.status === 'pending') : [];
    const historyRequests = editRequests.filter((req) => req.status === 'approved' || req.status === 'rejected');

    const approveEditRequestMutation = useApproveEditRequestMutation();
    const rejectEditRequestMutation = useRejectEditRequestMutation();

    const handleRejectClick = (requestId: number) => {
        setSelectedRequestId(requestId);
        setRejectNote('');
        setRejectDialogOpen(true);
    };

    const handleRejectConfirm = () => {
        if (selectedRequestId) {
            rejectEditRequestMutation.mutate(
                {
                    editRequestId: selectedRequestId,
                    data: { note: rejectNote.trim() || undefined },
                },
                {
                    onSuccess: () => {
                        setToastMessage('Edit request rejected');
                        setToastType('success');
                        setToastOpen(true);
                        setRejectDialogOpen(false);
                        setSelectedRequestId(null);
                        setRejectNote('');
                        refetch();
                    },
                    onError: (error) => {
                        const errorMsg = error.response?.data?.message || 'Failed to reject edit request';
                        setToastMessage(errorMsg);
                        setToastType('error');
                        setToastOpen(true);
                    },
                },
            );
        }
    };

    const handleApproveClick = (requestId: number) => {
        setSelectedRequestId(requestId);
        setApproveDialogOpen(true);
    };

    const handleApproveConfirm = () => {
        if (selectedRequestId) {
            approveEditRequestMutation.mutate(selectedRequestId, {
                onSuccess: () => {
                    setToastMessage('Edit request approved successfully');
                    setToastType('success');
                    setToastOpen(true);
                    setApproveDialogOpen(false);
                    setSelectedRequestId(null);
                    refetch();
                },
                onError: (error) => {
                    const errorMsg = error.response?.data?.message || 'Failed to approve edit request';
                    setToastMessage(errorMsg);
                    setToastType('error');
                    setToastOpen(true);
                },
            });
        }
    };

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

    const fieldLabel = FIELD_LABELS[contentKey] || contentKey;
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return '#4caf50';
            case 'rejected':
                return '#ff9800';
            default:
                return '#666';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'approved':
                return 'ACCEPTED';
            case 'rejected':
                return 'REJECTED';
            default:
                return status.toUpperCase();
        }
    };

    const renderEditRequestAccordion = (request: EditRequest, showActions: boolean = false) => (
        <Accordion
            key={request.id}
            defaultExpanded={false}
            sx={{
                mb: 2,
                boxShadow: 'none',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                '&:before': { display: 'none' },
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: '#666' }} />}
                sx={{
                    px: 2,
                    py: 1.5,
                    '& .MuiAccordionSummary-content': {
                        my: 1,
                    },
                    '& .MuiAccordionSummary-expandIconWrapper': {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    },
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: '#e8f5e9', color: '#1F8505' }}>{request.user.name[0]?.toUpperCase() || 'U'}</Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{request.user.name}</Typography>
                            {request.status !== 'pending' && (
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
                            )}
                        </Box>
                    </Box>
                    <Typography
                        sx={{
                            fontSize: 11,
                            color: '#888',
                            mr: 1,
                            // Prevent rotation when accordion expands
                            transform: 'none !important',
                        }}
                    >
                        {new Date(request.created_at).toLocaleDateString()}
                    </Typography>
                </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2, pb: 2, pt: 1 }}>
                {/* Edited Section */}
                <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1 }}>Edited</Typography>
                    <Paper
                        sx={{
                            p: 1.5,
                            bgcolor: '#e8f5e9',
                            borderRadius: 1,
                            border: '1px solid #c8e6c9',
                            maxHeight: 200,
                            overflow: 'auto',
                        }}
                    >
                        <Typography sx={{ fontSize: 13, color: '#1F8505', whiteSpace: 'pre-wrap' }}>
                            {formatValue(request.changes.new_value)}
                        </Typography>
                    </Paper>
                </Box>

                {/* Original Section */}
                <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1 }}>Original</Typography>
                    <Paper
                        sx={{
                            p: 1.5,
                            bgcolor: '#f9f9f9',
                            borderRadius: 1,
                            border: '1px solid #e0e0e0',
                            maxHeight: 200,
                            overflow: 'auto',
                        }}
                    >
                        <Typography sx={{ fontSize: 13, color: '#666', whiteSpace: 'pre-wrap' }}>{formatValue(request.changes.old_value)}</Typography>
                    </Paper>
                </Box>

                {/* Editor Note (if exists) */}
                {request.editor_note && (
                    <Box sx={{ mb: 2 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1 }}>Editor Note</Typography>
                        <Paper
                            sx={{
                                p: 1.5,
                                bgcolor: '#e3f2fd',
                                borderRadius: 1,
                                border: '1px solid #90caf9',
                                maxHeight: 200,
                                overflow: 'auto',
                            }}
                        >
                            <Typography sx={{ fontSize: 13, color: '#1565c0', whiteSpace: 'pre-wrap' }}>{request.editor_note}</Typography>
                        </Paper>
                    </Box>
                )}

                {/* Review Note (if exists) */}
                {request.review_note && (
                    <Box sx={{ mb: 2 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1 }}>Review Note</Typography>
                        <Paper
                            sx={{
                                p: 1.5,
                                bgcolor: '#fff3cd',
                                borderRadius: 1,
                                border: '1px solid #ffc107',
                                maxHeight: 200,
                                overflow: 'auto',
                            }}
                        >
                            <Typography sx={{ fontSize: 13, color: '#856404', whiteSpace: 'pre-wrap' }}>{request.review_note}</Typography>
                        </Paper>
                    </Box>
                )}

                {/* Action Buttons - Only show for pending requests and if user is owner */}
                {showActions && request.status === 'pending' && isOwner && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleApproveClick(request.id)}
                            disabled={approveEditRequestMutation.isPending || rejectEditRequestMutation.isPending}
                            sx={{
                                bgcolor: '#4caf50',
                                textTransform: 'none',
                                fontSize: 13,
                                py: 0.75,
                                flex: 1,
                                '&:hover': { bgcolor: '#45a049' },
                            }}
                        >
                            Approve
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<CloseIcon />}
                            onClick={() => handleRejectClick(request.id)}
                            disabled={approveEditRequestMutation.isPending || rejectEditRequestMutation.isPending}
                            sx={{
                                borderColor: '#f44336',
                                color: '#f44336',
                                textTransform: 'none',
                                fontSize: 13,
                                py: 0.75,
                                flex: 1,
                                '&:hover': { borderColor: '#d32f2f', bgcolor: 'rgba(244, 67, 54, 0.04)' },
                            }}
                        >
                            Reject
                        </Button>
                    </Box>
                )}
            </AccordionDetails>
        </Accordion>
    );

    return (
        <SinglePageLayout
            title={`Edit requests history - ${fieldLabel}`}
            rightElement={
                <Button
                    onClick={() => navigate(-1)}
                    sx={{
                        minWidth: 'auto',
                        p: 1,
                        color: '#666',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                    }}
                >
                    <CloseIcon />
                </Button>
            }
        >
            <Box sx={{ p: 2 }}>
                {/* Pendings Section - Only show for owners or if collaborator has their own pending requests */}
                {pendingRequests.length > 0 && (
                    <>
                        <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 2 }}>Pendings</Typography>
                        {pendingRequests.map((request) => renderEditRequestAccordion(request, isOwner))}
                    </>
                )}

                {/* History Section - Show for both owners and collaborators */}
                {historyRequests.length > 0 && (
                    <>
                        <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 2, mt: pendingRequests.length > 0 ? 4 : 0 }}>History</Typography>
                        {historyRequests.map((request) => renderEditRequestAccordion(request, false))}
                    </>
                )}

                {/* Empty State */}
                {pendingRequests.length === 0 && historyRequests.length === 0 && (
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f9f9f9' }}>
                        <Typography sx={{ color: '#888', fontSize: 14 }}>
                            {isOwner ? 'No edit requests found' : 'No edit request history found'}
                        </Typography>
                    </Paper>
                )}

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
                            maxWidth: '90vw',
                        },
                    }}
                >
                    <DialogTitle sx={{ fontWeight: 700, fontSize: 16 }}>Rejection note (optional)</DialogTitle>
                    <DialogContent>
                        <Typography sx={{ fontSize: 13, mb: 1.5, color: '#666' }}>Rejection note</Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            placeholder="Why you reject?"
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
                            disabled={rejectEditRequestMutation.isPending}
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

                {/* Approve Dialog */}
                <Dialog
                    open={approveDialogOpen}
                    onClose={() => {
                        setApproveDialogOpen(false);
                    }}
                    PaperProps={{
                        sx: {
                            borderRadius: 3,
                            p: 1,
                            width: 400,
                            maxWidth: '90vw',
                        },
                    }}
                >
                    <DialogContent sx={{ textAlign: 'center', py: 3 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 3 }}>Are you sure you want to approve?</Typography>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button
                                onClick={() => {
                                    setApproveDialogOpen(false);
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
                                onClick={handleApproveConfirm}
                                variant="contained"
                                disabled={approveEditRequestMutation.isPending}
                                sx={{
                                    bgcolor: '#4caf50',
                                    textTransform: 'none',
                                    borderRadius: 2,
                                    '&:hover': { bgcolor: '#45a049' },
                                }}
                            >
                                Sure
                            </Button>
                        </Box>
                    </DialogContent>
                </Dialog>

                {/* Toast */}
                <Toast open={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
            </Box>
        </SinglePageLayout>
    );
};

export default EditRequestsPage;
