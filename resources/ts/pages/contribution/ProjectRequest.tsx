import { Alert, Avatar, Box, Button, CircularProgress, Paper, Snackbar, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { contributionApi } from '../../api/contribution';
import AppButton from '../../components/AppButton';
import SinglePageLayout from '../../components/SinglePageLayout';

interface RequestDetails {
    id: number;
    contribution_id: number;
    user_id: number;
    reason: string;
    status: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        username: string;
        avatar?: string;
    };
    contribution: {
        id: number;
        title: string;
        thumbnail_url?: string;
    };
}

// Helper function to format time ago
const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}hr ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
};

const DEFAULT_IMAGE = '/assets/images/idea-sample.png';

const ProjectRequest: React.FC = () => {
    const { requestId } = useParams<{ requestId: string }>();
    const navigate = useNavigate();
    const [request, setRequest] = useState<RequestDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    useEffect(() => {
        const fetchRequest = async () => {
            if (!requestId) return;
            try {
                const response = await apiClient.getClient().get(`/project/collaboration`, {
                    params: { request_id: requestId },
                });
                const collaborations = response.data?.data?.collaborations || [];
                const found = collaborations.find((c: RequestDetails) => c.id === parseInt(requestId));
                setRequest(found || null);
            } catch (error) {
                console.error('Failed to load request:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRequest();
    }, [requestId]);

    const handleAccept = async () => {
        if (!request) return;
        setProcessing(true);
        try {
            await contributionApi.collaborationAction(request.id, 1);
            setToastMessage(`${request.user.name} has been accepted!`);
            setToastType('success');
            setToastOpen(true);
            setTimeout(() => navigate('/notifications'), 1500);
        } catch {
            setToastMessage('Failed to accept request');
            setToastType('error');
            setToastOpen(true);
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!request) return;
        setProcessing(true);
        try {
            await contributionApi.collaborationAction(request.id, 2);
            setToastMessage('Request has been rejected');
            setToastType('success');
            setToastOpen(true);
            setTimeout(() => navigate('/notifications'), 1500);
        } catch {
            setToastMessage('Failed to reject request');
            setToastType('error');
            setToastOpen(true);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <SinglePageLayout title="Project request">
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress sx={{ color: '#1F8505' }} />
                </Box>
            </SinglePageLayout>
        );
    }

    if (!request) {
        return (
            <SinglePageLayout title="Project request">
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="body1" sx={{ color: '#666' }}>
                        Request not found
                    </Typography>
                </Box>
            </SinglePageLayout>
        );
    }

    return (
        <SinglePageLayout title="Project request" onBackClick={() => navigate(-1)}>
            <Paper elevation={0} sx={{ bgcolor: '#fff', borderRadius: 3, p: 3 }}>
                {/* Requester Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar src={request.user.avatar} sx={{ width: 50, height: 50, bgcolor: '#e8f5e9', color: '#1F8505', mr: 2 }}>
                        {request.user.name[0]?.toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 16 }}>
                            {request.user.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#999' }}>
                            {formatTimeAgo(request.created_at)}
                        </Typography>
                    </Box>
                </Box>

                {/* Requested To Section */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ color: '#999', mb: 1.5 }}>
                        Requested to
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: '#f9f9f9', borderRadius: 2 }}>
                        <Box
                            component="img"
                            src={request.contribution.thumbnail_url || DEFAULT_IMAGE}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = DEFAULT_IMAGE;
                            }}
                            sx={{ width: 60, height: 60, borderRadius: 2, objectFit: 'cover', mr: 2, bgcolor: '#ddd' }}
                        />
                        <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {request.contribution.title}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Reason Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle2" sx={{ color: '#999', mb: 1 }}>
                        Reason
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#444', lineHeight: 1.6 }}>
                        {request.reason}
                    </Typography>
                </Box>

                {/* Action Buttons */}
                {request.status === 'pending' && (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <AppButton fullWidth disabled={processing} onClick={handleAccept} sx={{ py: 1.5, borderRadius: 2 }}>
                            {processing ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Accept'}
                        </AppButton>
                        <Button
                            variant="outlined"
                            fullWidth
                            disabled={processing}
                            onClick={handleReject}
                            sx={{
                                borderColor: '#f44336',
                                color: '#f44336',
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                '&:hover': { borderColor: '#d32f2f', bgcolor: '#fff5f5' },
                            }}
                        >
                            Reject
                        </Button>
                    </Box>
                )}

                {request.status !== 'pending' && (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Typography
                            variant="body1"
                            sx={{
                                color: request.status === 'accepted' ? '#1F8505' : '#f44336',
                                fontWeight: 600,
                            }}
                        >
                            This request has been {request.status}
                        </Typography>
                    </Box>
                )}
            </Paper>

            {/* Toast */}
            <Snackbar
                open={toastOpen}
                autoHideDuration={3000}
                onClose={() => setToastOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setToastOpen(false)} severity={toastType} sx={{ width: '100%' }}>
                    {toastMessage}
                </Alert>
            </Snackbar>
        </SinglePageLayout>
    );
};

export default ProjectRequest;
