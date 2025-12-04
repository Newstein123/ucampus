import { Button, Paper, Typography } from '@mui/material';
import React, { useState } from 'react';
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';

const NotificationTest: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [lastTest, setLastTest] = useState<string>('');

    const triggerTestNotification = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.getClient().post(endpoints.notification_test);
            console.log('Test notification response:', response.data);
            setLastTest(new Date().toLocaleTimeString());
        } catch (error) {
            console.error('Error triggering test notification:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 2, m: 2, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#1F8505' }}>
                Notification Test Panel
            </Typography>
            <Button
                variant="contained"
                onClick={triggerTestNotification}
                disabled={isLoading}
                sx={{
                    bgcolor: '#1F8505',
                    mb: 2,
                    '&:hover': { bgcolor: '#1a7a04' },
                }}
            >
                {isLoading ? 'Sending...' : 'Send Test Notification'}
            </Button>
            {lastTest && (
                <Typography variant="body2" sx={{ color: '#666' }}>
                    Last test sent at: {lastTest}
                </Typography>
            )}
            <Typography variant="caption" sx={{ color: '#888', display: 'block', mt: 1 }}>
                Check the browser console for real-time notification logs
            </Typography>
        </Paper>
    );
};

export default NotificationTest;
