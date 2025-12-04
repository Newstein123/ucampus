import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';
import { Avatar, Badge, Box, Button, Divider, List, ListItem, ListItemAvatar, ListItemText, Paper, Tab, Tabs, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SinglePageLayout from '../components/SinglePageLayout';
import useNotificationListQuery from '../hooks/notification/useNotificationListQuery';
import useNotificationReadMutation from '../hooks/notification/useNotificationReadMutation';
import { Notification as NotificationType } from '../types/notification';

// Using the API Notification type instead of local interface

const Notifications: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(0);
    const [page] = useState(1);

    const { data: notificationData, isLoading, error } = useNotificationListQuery({ page, per_page: 20 });
    const readMutation = useNotificationReadMutation();

    const notifications = notificationData?.data?.notifications || [];
    const filteredNotifications = activeTab === 0 ? notifications : notifications.filter((notification) => !notification.is_read);

    const getNotificationIcon = (notification: NotificationType) => {
        // Determine icon based on message content or sender
        if (notification.message.includes('rejected')) {
            return <CancelIcon sx={{ color: '#f44336' }} />;
        }
        if (notification.message.includes('accepted')) {
            return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
        }
        if (notification.message.includes('update') || notification.message.includes('Terms')) {
            return <InfoIcon sx={{ color: '#2196f3' }} />;
        }
        return <PersonIcon sx={{ color: '#666' }} />;
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleNotificationClick = (notification: NotificationType) => {
        if (!notification.is_read) {
            readMutation.mutate({ notification_id: notification.id });
        }

        // Handle redirect if available
        if (notification.redirect_url) {
            window.location.href = notification.redirect_url;
        }
    };

    const handleActionClick = (notification: NotificationType) => {
        // Handle action button click based on notification content
        console.log('Action clicked for notification:', notification.id);
    };

    return (
        <SinglePageLayout title={t('Notifications')}>
            {/* Test Component - Remove in production */}
            {/* <NotificationTest /> */}

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
                                        '&:hover': {
                                            bgcolor: '#f8f9fa',
                                        },
                                    }}
                                    onClick={() => handleNotificationClick(notification)}
                                >
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
                                    {notification.message.includes('update') && (
                                        <Button
                                            variant="contained"
                                            size="small"
                                            sx={{
                                                bgcolor: '#4caf50',
                                                color: 'white',
                                                borderRadius: '20px',
                                                textTransform: 'none',
                                                fontSize: '12px',
                                                px: 2,
                                                py: 0.5,
                                                '&:hover': {
                                                    bgcolor: '#45a049',
                                                },
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleActionClick(notification);
                                            }}
                                        >
                                            Update
                                        </Button>
                                    )}
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
        </SinglePageLayout>
    );
};

export default Notifications;
