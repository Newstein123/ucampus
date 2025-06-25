import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { Box, Typography, Avatar, Button, Divider, List, ListItem, ListItemText, ListSubheader } from '@mui/material';
import { logout } from '../store/authSlice';
import Layout from '../components/Layout';

const MyProfile: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch<any>();

    const handleLogout = () => {
        dispatch(logout());
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
                            {user.name?.[0] || 'U'}
                        </Typography>
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {user.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#888' }}>
                        @{user.username}
                    </Typography>
                </Box>

                <List
                    subheader={
                        <ListSubheader component="div" sx={{ bgcolor: 'inherit', fontWeight: 700, color: '#888', fontSize: 14 }}>
                            My Contributions
                        </ListSubheader>
                    }
                    sx={{ bgcolor: '#fff', borderRadius: 2, mb: 2, boxShadow: 0 }}
                >
                    <ListItem>
                        <ListItemText primary="My ideas and questions" />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Public discussions" />
                    </ListItem>
                    <ListItem>
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

                <List
                    subheader={
                        <ListSubheader component="div" sx={{ bgcolor: 'inherit', fontWeight: 700, color: '#888', fontSize: 14 }}>
                            My Collaborations
                        </ListSubheader>
                    }
                    sx={{ bgcolor: '#fff', borderRadius: 2, mb: 2, boxShadow: 0 }}
                >
                    <ListItem>
                        <ListItemText primary="Projects" />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Public discussions" />
                    </ListItem>
                </List>

                <Divider sx={{ my: 2 }} />

                <List sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: 0 }}>
                    <ListItem>
                        <ListItemText primary="Recent Calls" />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Devices" />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Notifications" />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Appearance" />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Language" />
                    </ListItem>
                </List>
            </Box>
        </Layout>
    );
};

export default MyProfile;