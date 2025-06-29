import React from 'react';
import { AppBar, Toolbar, Box, BottomNavigation, BottomNavigationAction, Paper, Badge } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/TravelExplore';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FolderIcon from '@mui/icons-material/Folder';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';
import NotificationIcon from '@mui/icons-material/Notifications';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [value, setValue] = React.useState(0);
    const navigate = useNavigate();
    return (
        <Box
            sx={{
                bgcolor: '#f7fafd',
                minHeight: '100vh',
                maxWidth: 600,
                mx: 'auto',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
            }}
        >
            {/* Navbar */}
            <AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #eee', px: 2, top: 0, zIndex: 1100, bgcolor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(8px)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
                    <Toolbar>
                        <img src='/assets/images/logo.png' alt="logo" width={70} height={70} />
                    </Toolbar>
                    <Badge badgeContent={4} color='success' sx={{ mr: 2 }}>
                        <NotificationIcon sx={{ fontSize: 30, color: '#1F2024' }} />
                    </Badge>
                </Box>
            </AppBar>

            {/* Main Content */}
            <Box sx={{ flex: 1, p: 2, pb: 8 }}>
                {children}
            </Box>

            {/* Footer */}
            <Paper
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100%',
                    maxWidth: 600,
                    borderTop: '1px solid #eee',
                    bgcolor: '#fff',
                }}
                elevation={3}
            >
                <BottomNavigation
                    showLabels
                    value={value}
                    onChange={(_, newValue) => setValue(newValue)}
                    sx={{
                        bgcolor: '#fff',
                        '.Mui-selected, .Mui-selected svg': {
                            color: '#1F8505',
                        },
                        '.MuiBottomNavigationAction-label.Mui-selected': {
                            color: '#1F8505',
                        },
                        '.MuiBottomNavigationAction-root': {
                            color: '#71727A',
                        },
                    }}
                >
                    <BottomNavigationAction onClick={() => navigate('/')} label="Home" icon={<HomeIcon />} />
                    <BottomNavigationAction onClick={() => navigate('/explore')} label="Explore" icon={<ExploreIcon />} />
                    <BottomNavigationAction onClick={() => navigate('/contribution/create')} label="Create" icon={<AddCircleOutlineIcon />} />
                    <BottomNavigationAction onClick={() => navigate('/projects')} label="Projects" icon={<FolderIcon />} />
                    <BottomNavigationAction onClick={() => navigate('/myhub')} label="My Hub" icon={<PersonIcon />} />
                </BottomNavigation>
            </Paper>
        </Box>
    );
};

export default Layout; 