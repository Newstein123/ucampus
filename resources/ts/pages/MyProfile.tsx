import React from 'react';
import { useDispatch } from 'react-redux';
import { Box, Typography, Avatar, Button, Divider, List, ListItem, ListItemText, ListSubheader } from '@mui/material';
import { logout } from '../store/slices/authSlice';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import useUserLogoutMutation from '../hooks/auth/useUserLogoutMutation';
import useUserProfileQuery from '../hooks/auth/useUserProfileQuery';

const MyProfile: React.FC = () => {
    const dispatch = useDispatch<any>();
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
            }
        });
    };

    if (!user) return null;

    return (
        <Layout>
            <Box sx={{ bgcolor: '#f5f6fa', minHeight: '100vh', px: 2, py: 3 }}>
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
                        <ListItemText primary="My ideas and questions" />
                    </ListItem>
                    <ListItem sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                        <ListItemText primary="Terms & Conditions" />
                    </ListItem>
                    <ListItem sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                        <ListItemText primary="Contact Us" />
                    </ListItem>
                    <ListItem sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                        <ListItemText primary="Language" />
                    </ListItem>
                    <ListItem sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                        <ListItemText primary="Change Password" />
                    </ListItem>
                    <ListItem sx={{ borderBottom: '1px solid #eee', py: 2 }}>
                        <Button
                            variant="outlined"
                            color="error"
                            fullWidth
                            onClick={handleLogout}
                            sx={{ mt: 1, textTransform: 'none', fontWeight: 600 }}
                        >
                            Logout
                        </Button>
                    </ListItem>
                </List>
            </Box>
        </Layout>
    );
};

export default MyProfile;