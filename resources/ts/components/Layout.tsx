import React from 'react';
import { AppBar, Toolbar, Typography, Box, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/TravelExplore';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FolderIcon from '@mui/icons-material/Folder';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [value, setValue] = React.useState(0);
    const navigate = useNavigate();
    return (
        <Box
            sx={{
                bgcolor: '#f7fafd',
                minHeight: '100vh',
                maxWidth: 400,
                mx: 'auto',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
            }}
        >
            {/* Navbar */}
            <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #eee' }}>
                <Toolbar>
                    <Typography variant="subtitle1" sx={{ color: '#c1c1c1', fontWeight: 500 }}>
                        Home
                    </Typography>
                </Toolbar>
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
                    maxWidth: 400,
                    borderTop: '1px solid #eee',
                    bgcolor: '#4caf50',
                }}
                elevation={3}
            >
                <BottomNavigation
                    showLabels
                    value={value}
                    onChange={(_, newValue) => setValue(newValue)}
                    sx={{
                        bgcolor: '#4caf50',
                        '.Mui-selected, .Mui-selected svg': {
                            color: '#fff',
                        },
                        '.MuiBottomNavigationAction-label.Mui-selected': {
                            color: '#fff',
                        },
                        '.MuiBottomNavigationAction-root': {
                            color: '#e0e0e0',
                        },
                    }}
                >
                    <BottomNavigationAction onClick={() => navigate('/')} label="Home" icon={<HomeIcon />} />
                    <BottomNavigationAction label="Explore" icon={<ExploreIcon />} />
                    <BottomNavigationAction label="Create" icon={<AddCircleOutlineIcon />} />
                    <BottomNavigationAction label="Projects" icon={<FolderIcon />} />
                    <BottomNavigationAction onClick={() => navigate('/myhub')} label="My Hub" icon={<PersonIcon />} />
                </BottomNavigation>
            </Paper>
        </Box>
    );
};

export default Layout; 