import { Avatar, Box, Button, List, ListItem, ListItemText, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import useUserLogoutMutation from '../hooks/auth/useUserLogoutMutation';
import useUserProfileQuery from '../hooks/auth/useUserProfileQuery';
import { AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';

const MyProfile: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const userLogoutMutation = useUserLogoutMutation();
    const { data: user } = useUserProfileQuery();
    const handleLogout = () => {
        userLogoutMutation.mutate(undefined, {
            onSuccess: () => {
                dispatch(logout());
                navigate('/login');
            },
            onError: (error) => {
                console.error(error);
            },
        });
    };

    if (!user) return null;

    return (
        <Layout>
            <Typography align="center" variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                My Hub
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: '#d9f5d6', mb: 1 }}>
                    <Typography variant="h3" sx={{ color: '#b0c4b1' }}>
                        {user.data.name?.[0] || 'U'}
                    </Typography>
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {user.data.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#888' }}>
                    @{user.data.username}
                </Typography>
            </Box>
            <List sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: 0 }}>
                <ListItem sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                    <ListItemText
                        primary={t('My ideas and questions')}
                        onClick={() => navigate('/my-ideas-and-questions')}
                        sx={{ cursor: 'pointer' }}
                    />
                </ListItem>
                <ListItem sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                    <ListItemText
                        primary={t('Bookmarks')}
                        onClick={() => navigate('/bookmarks')}
                        sx={{ cursor: 'pointer' }}
                    />
                </ListItem>
                <ListItem sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                    <ListItemText primary={t('Terms & Conditions')} onClick={() => navigate('/terms-and-conditions')} sx={{ cursor: 'pointer' }} />
                </ListItem>
                <ListItem sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                    <ListItemText primary={t('Contact us')} onClick={() => navigate('/contact-us')} sx={{ cursor: 'pointer' }} />
                </ListItem>
                <ListItem sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                    <ListItemText primary={t('Language')} onClick={() => navigate('/language')} sx={{ cursor: 'pointer' }} />
                </ListItem>
                <ListItem sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                    <ListItemText primary={t('Change password')} onClick={() => navigate('/change-password')} sx={{ cursor: 'pointer' }} />
                </ListItem>
            </List>
            <Button variant="contained" color="error" fullWidth onClick={handleLogout} sx={{ mt: 1, textTransform: 'none', fontWeight: 600 }}>
                {t('Logout')}
            </Button>
        </Layout>
    );
};

export default MyProfile;
