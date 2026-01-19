import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';
import {
    Alert,
    Avatar,
    Badge,
    Box,
    Button,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    Snackbar,
    Tab,
    Tabs,
    Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { contributionApi } from '../api/contribution';
import AppButton from '../components/AppButton';
import SinglePageLayout from '../components/SinglePageLayout';
import useNotificationListQuery from '../hooks/notification/useNotificationListQuery';
import useNotificationReadMutation from '../hooks/notification/useNotificationReadMutation';
import { Notification as NotificationType } from '../types/notification';

const Notifications: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [page] = useState(1);
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
    // Track notifications that have been acted upon (accepted/rejected)
    const [actedNotifications, setActedNotifications] = useState<Map<number, 'accepted' | 'rejected'>>(new Map());

    const { data: notificationData, isLoading, error } = useNotificationListQuery({ page, per_page: 20 });
    const readMutation = useNotificationReadMutation();

    const notifications = notificationData?.data?.notifications || [];
    const filteredNotifications = activeTab === 0 ? notifications : notifications.filter((notification) => !notification.is_read);

    const getNotificationIcon = (notification: NotificationType) => {
        if (notification.type === 'collaboration_response' && notification.message.includes('rejected')) {
            return <CancelIcon sx={{ color: '#f44336' }} />;
        }
        if (notification.type === 'collaboration_response' && notification.message.includes('accepted')) {
            return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
        }
        if (notification.message.includes('update') || notification.message.includes('Terms')) {
            return <InfoIcon sx={{ color: '#2196f3' }} />;
        }
        return <PersonIcon sx={{ color: '#666' }} />;
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleNotificationClick = (notification: NotificationType) => {
        if (!notification.is_read) {
            readMutation.mutate({ notification_id: notification.id });
        }

        if (notification.redirect_url) {
            const url = notification.redirect_url.trim();

            if (url.startsWith('/')) {
                // Relative path - navigate within app
                navigate(url);
            } else if (url.startsWith('http://') || url.startsWith('https://')) {
                // Full URL - check if it's from same origin
                try {
                    const urlObj = new URL(url);
                    const currentOrigin = window.location.origin;

                    if (urlObj.origin === currentOrigin) {
                        // Same origin - extract path and navigate within app
                        const path = urlObj.pathname + urlObj.search + urlObj.hash;
                        navigate(path);
                    } else {
                        // External URL - open in new tab
                        window.open(url, '_blank');
                    }
                } catch (error) {
                    // Invalid URL - try to navigate as-is
                    console.error('Error parsing URL:', error);
                    navigate(url);
                }
            } else {
                // Fallback - navigate as-is (treat as relative path)
                navigate(url.startsWith('/') ? url : '/' + url);
            }
        }
    };

    const handleAccept = async (e: React.MouseEvent, notification: NotificationType) => {
        e.stopPropagation();
        if (!notification.source_id) return;

        setProcessingIds((prev) => new Set(prev).add(notification.id));
        try {
            await contributionApi.collaborationAction(notification.source_id, 1);
            readMutation.mutate({ notification_id: notification.id });
            setToastMessage(`${notification.sender?.name || 'User'} has been accepted!`);
            setToastType('success');
            setToastOpen(true);
            // Mark as acted upon
            setActedNotifications((prev) => new Map(prev).set(notification.id, 'accepted'));
        } catch {
            setToastMessage('Failed to accept request');
            setToastType('error');
            setToastOpen(true);
        } finally {
            setProcessingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(notification.id);
                return newSet;
            });
        }
    };

    const handleReject = async (e: React.MouseEvent, notification: NotificationType) => {
        e.stopPropagation();
        if (!notification.source_id) return;

        setProcessingIds((prev) => new Set(prev).add(notification.id));
        try {
            await contributionApi.collaborationAction(notification.source_id, 2);
            readMutation.mutate({ notification_id: notification.id });
            setToastMessage('Request has been rejected');
            setToastType('success');
            setToastOpen(true);
            // Mark as acted upon
            setActedNotifications((prev) => new Map(prev).set(notification.id, 'rejected'));
        } catch {
            setToastMessage('Failed to reject request');
            setToastType('error');
            setToastOpen(true);
        } finally {
            setProcessingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(notification.id);
                return newSet;
            });
        }
    };

    const handleView = (e: React.MouseEvent, notification: NotificationType) => {
        e.stopPropagation();
        if (notification.source_id) {
            navigate(`/contribution/request/${notification.source_id}`);
        }
    };

    // Check if notification is a pending collaboration request (not yet handled)
    const isPendingCollaborationRequest = (notification: NotificationType) => {
        return notification.type === 'collaboration_request';
    };

    // Check if notification is a handled collaboration request (accepted or rejected)
    const isHandledCollaborationRequest = (notification: NotificationType) => {
        return notification.type === 'collaboration_request_accepted' || notification.type === 'collaboration_request_rejected';
    };

    // Get the action status from notification type
    const getNotificationActionStatus = (notification: NotificationType): 'accepted' | 'rejected' | null => {
        if (notification.type === 'collaboration_request_accepted') return 'accepted';
        if (notification.type === 'collaboration_request_rejected') return 'rejected';
        return actedNotifications.get(notification.id) || null;
    };

    return (
        <SinglePageLayout title={t('Notifications')}>
            <Paper elevation={0} sx={{ bgcolor: '#fff', borderRadius: 3, m: 0, p: 2 }}>
                {/* Tabs */}
                <Paper sx={{ mb: 2, borderRadius: '20px', boxShadow: 'none', p: 0, backgroundColor: '#f0f8f0' }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        sx={{
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 500,
                                fontSize: '14px',
                                color: '#666',
                                border: 'none',
                                outline: 'none',
                                borderRadius: '20px',
                                '&.Mui-selected': {
                                    color: '#fff',
                                    backgroundColor: '#1F8505',
                                    border: 'none',
                                },
                                '&:focus': {
                                    border: 'none',
                                    outline: 'none',
                                },
                            },
                            '& .MuiTabs-indicator': {
                                display: 'none',
                            },
                        }}
                    >
                        <Tab label={`${t('All')} (${notifications.length})`} sx={{ mx: 1, my: 1, border: 'none', outline: 'none' }} />
                        <Tab
                            label={`${t('Unread')} (${notifications.filter((n) => !n.is_read).length})`}
                            sx={{ mx: 1, my: 1, border: 'none', outline: 'none' }}
                        />
                    </Tabs>
                </Paper>

                {/* Notifications List */}
                {isLoading ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" sx={{ color: '#666' }}>
                            {t('Loading notifications...')}
                        </Typography>
                    </Box>
                ) : error ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" sx={{ color: '#f44336' }}>
                            {t('Error loading notifications')}
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ bgcolor: 'transparent' }}>
                        {filteredNotifications.map((notification, index) => (
                            <React.Fragment key={notification.id}>
                                <ListItem
                                    sx={{
                                        bgcolor: 'white',
                                        borderRadius: 2,
                                        mb: 1,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        cursor: 'pointer',
                                        flexDirection: 'column',
                                        alignItems: 'stretch',
                                        '&:hover': {
                                            bgcolor: '#f8f9fa',
                                        },
                                    }}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                                        <ListItemAvatar>
                                            <Badge
                                                color="error"
                                                variant="dot"
                                                invisible={notification.is_read}
                                                sx={{
                                                    '& .MuiBadge-dot': {
                                                        backgroundColor: '#f44336',
                                                    },
                                                }}
                                            >
                                                {/* Special icons for collaboration response notifications */}
                                                {notification.type === 'collaboration_response' ? (
                                                    <Avatar
                                                        sx={{
                                                            width: 40,
                                                            height: 40,
                                                            bgcolor: '#e0e0e0',
                                                        }}
                                                    >
                                                        {notification.message.includes('accepted') ? (
                                                            <CheckCircleIcon sx={{ color: '#000000ff', fontSize: 24 }} />
                                                        ) : (
                                                            <CancelIcon sx={{ color: '#666', fontSize: 24 }} />
                                                        )}
                                                    </Avatar>
                                                ) : (
                                                    <Avatar
                                                        sx={{
                                                            width: 40,
                                                            height: 40,
                                                            bgcolor: notification.sender?.avatar ? 'transparent' : '#e0e0e0',
                                                        }}
                                                    >
                                                        {notification.sender?.avatar ? (
                                                            <img
                                                                src={notification.sender.avatar}
                                                                alt={notification.sender.name || 'User'}
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            />
                                                        ) : notification.sender?.name ? (
                                                            <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                                                                {notification.sender.name
                                                                    .split(' ')
                                                                    .map((n: string) => n[0])
                                                                    .join('')
                                                                    .toUpperCase()}
                                                            </Typography>
                                                        ) : (
                                                            getNotificationIcon(notification)
                                                        )}
                                                    </Avatar>
                                                )}
                                            </Badge>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: notification.is_read ? 400 : 600,
                                                        color: notification.is_read ? '#666' : '#1F2024',
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    {notification.sender?.name || 'System'}
                                                </Typography>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: '#666',
                                                            fontSize: '13px',
                                                            mb: 0.5,
                                                        }}
                                                    >
                                                        {notification.message}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: '#999',
                                                            fontSize: '12px',
                                                        }}
                                                    >
                                                        {notification.created_at}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </Box>

                                    {/* Action buttons or result for collaboration requests */}
                                    {(isPendingCollaborationRequest(notification) || isHandledCollaborationRequest(notification)) &&
                                        (() => {
                                            const actionStatus = getNotificationActionStatus(notification);

                                            if (actionStatus) {
                                                // Show result (from backend type or local state)
                                                return (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, pl: 7 }}>
                                                        {actionStatus === 'accepted' ? (
                                                            <>
                                                                <CheckCircleIcon sx={{ color: '#1F8505', fontSize: 20 }} />
                                                                <Typography variant="body2" sx={{ color: '#1F8505' }}>
                                                                    {notification.sender?.name || 'User'} has been accepted
                                                                </Typography>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CancelIcon sx={{ color: '#f44336', fontSize: 20 }} />
                                                                <Typography variant="body2" sx={{ color: '#f44336' }}>
                                                                    Request has been rejected
                                                                </Typography>
                                                            </>
                                                        )}
                                                    </Box>
                                                );
                                            }

                                            // Show action buttons for pending requests
                                            return (
                                                <Box sx={{ display: 'flex', gap: 1, mt: 1.5, pl: 7 }}>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={(e) => handleView(e, notification)}
                                                        sx={{
                                                            borderColor: '#1F8505',
                                                            color: '#1F8505',
                                                            borderRadius: '20px',
                                                            textTransform: 'none',
                                                            fontSize: '12px',
                                                            px: 2,
                                                            py: 0.5,
                                                            '&:hover': {
                                                                borderColor: '#165d04',
                                                                bgcolor: '#f0f8f0',
                                                            },
                                                        }}
                                                    >
                                                        View
                                                    </Button>
                                                    <AppButton
                                                        size="small"
                                                        disabled={processingIds.has(notification.id)}
                                                        onClick={(e) => handleAccept(e, notification)}
                                                        sx={{
                                                            borderRadius: '20px',
                                                            fontSize: '12px',
                                                            px: 2,
                                                            py: 0.5,
                                                        }}
                                                    >
                                                        Accept
                                                    </AppButton>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        disabled={processingIds.has(notification.id)}
                                                        onClick={(e) => handleReject(e, notification)}
                                                        sx={{
                                                            borderColor: '#f44336',
                                                            color: '#f44336',
                                                            borderRadius: '20px',
                                                            textTransform: 'none',
                                                            fontSize: '12px',
                                                            px: 2,
                                                            py: 0.5,
                                                            '&:hover': {
                                                                borderColor: '#d32f2f',
                                                                bgcolor: '#fff5f5',
                                                            },
                                                        }}
                                                    >
                                                        Reject
                                                    </Button>
                                                </Box>
                                            );
                                        })()}
                                </ListItem>
                                {index < filteredNotifications.length - 1 && <Divider sx={{ my: 1, opacity: 0.3 }} />}
                            </React.Fragment>
                        ))}

                        {filteredNotifications.length === 0 && (
                            <Box
                                sx={{
                                    textAlign: 'center',
                                    py: 4,
                                    color: '#666',
                                }}
                            >
                                <Typography variant="body1">{activeTab === 0 ? t('No notifications yet') : t('No unread notifications')}</Typography>
                            </Box>
                        )}
                    </List>
                )}
            </Paper>

            {/* Toast notification */}
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

export default Notifications;
