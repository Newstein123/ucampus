import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FolderIcon from '@mui/icons-material/Folder';
import HomeIcon from '@mui/icons-material/Home';
import NotificationIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import ExploreIcon from '@mui/icons-material/TravelExplore';
import { AppBar, Badge, BottomNavigation, BottomNavigationAction, Box, Paper, Toolbar } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useHomeContext } from '../contexts/HomeContext';
import useNotificationUnreadCountQuery from '../hooks/notification/useNotificationUnreadCountQuery';
import { useNotificationListener } from '../hooks/useNotificationListener';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { triggerHomeRestart } = useHomeContext();
    const { data: unreadCountData } = useNotificationUnreadCountQuery();

    useNotificationListener({
        onNotification: (notification) => {
            console.log('notification created', notification);
        },
        onError: (error) => {
            console.error('Notification listener error:', error);
        },
    });

    const handleHomeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (location.pathname === '/') {
            console.log('triggerHomeRestart');
            triggerHomeRestart();
        } else {
            navigate('/');
        }
    };

    const path = location.pathname;

    // Scroll to hide header/footer logic for PWA
    const [showNavbar, setShowNavbar] = React.useState(true);
    const lastScrollY = React.useRef(0);
    const mainContentRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleScroll = () => {
            // Only apply in PWA mode
            if (!window.matchMedia('(display-mode: standalone)').matches) return;

            // Only apply scroll-to-hide on Home page
            const isHomePage = path === '/' || path.startsWith('/home');
            if (!isHomePage) {
                setShowNavbar(true);
                return;
            }

            const currentScrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            // Sensitivity threshold to prevent micro-jitter
            if (Math.abs(currentScrollY - lastScrollY.current) < 10) return;

            // Show navbar at the top, when scrolling up, or at the bottom
            if (currentScrollY <= 0 || (currentScrollY + windowHeight >= documentHeight - 20)) {
                setShowNavbar(true);
            } else if (currentScrollY > lastScrollY.current) {
                // Scrolling down -> Hide
                setShowNavbar(false);
            } else {
                // Scrolling up -> Show
                setShowNavbar(true);
            }
            lastScrollY.current = currentScrollY;
        };



        // Also listen to window scroll for non-PWA fallback or mismatched containers
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {

            window.removeEventListener('scroll', handleScroll);
        };
    }, [path]);

    const navigationValue = (() => {
        if (path === '/' || path.startsWith('/home')) return 'home';
        if (path.startsWith('/explore')) return 'explore';
        if (path.startsWith('/contribution')) return 'create';
        if (path.startsWith('/projects')) return 'projects';
        if (path.startsWith('/myhub')) return 'myhub';
        return '';
    })();

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
                '@media (display-mode: standalone)': {
                    '@supports (-webkit-touch-callout: none)': {
                        // height: '-webkit-fill-available', // Removed to allow window scroll
                        minHeight: '100vh',
                    },
                },
            }}
        >
            {/* Navbar */}
            <AppBar
                position="sticky"
                color="transparent"
                elevation={0}
                className="header-fixed"
                sx={{
                    borderBottom: '1px solid #eee',
                    px: 2,
                    top: 0,
                    zIndex: 1100,
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(8px)',
                    transition: 'transform 0.3s ease-in-out',
                    transform: showNavbar ? 'translateY(0)' : 'translateY(-100%)',
                    '@media (display-mode: standalone)': {
                        '@supports (-webkit-touch-callout: none)': {
                            paddingTop: 'env(safe-area-inset-top)',
                            // Fixed positioning for all pages to prevent rubber-banding
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            margin: '0 auto',
                            width: '100%',
                            maxWidth: 600,
                        },
                    },
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '60px' }}>
                    <Toolbar sx={{ p: 0 }}>
                        <img src="/assets/images/logo.png" alt="logo" width={70} height={70} />
                    </Toolbar>
                    <Badge badgeContent={unreadCountData?.data?.unread_count || 0} color="success" sx={{ mr: 2 }}>
                        <NotificationIcon sx={{ fontSize: 30, color: '#1F2024', cursor: 'pointer' }} onClick={() => navigate('/notifications')} />
                    </Badge>
                </Box>
            </AppBar>

            {/* Main Content */}
            <Box
                ref={mainContentRef}
                className="pwa-main-content"
                sx={{
                    flex: 1,
                    p: 2,
                    pb: 8,
                    '@media (display-mode: standalone)': {
                        '@supports (-webkit-touch-callout: none)': {
                            mb: 'env(safe-area-inset-bottom)',
                            // Add top spacing for fixed header
                            paddingTop: 'calc(60px + env(safe-area-inset-top))',
                            // Ensure enough padding for fixed footer + PWA safe area
                            pb: 10,
                        },
                    },
                }}
            >
                {children}
            </Box>

            {/* Footer */}
            <Paper
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: '50%',
                    transform: showNavbar ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(100%)',
                    transition: 'transform 0.3s ease-in-out',
                    width: '100%',
                    maxWidth: 600,
                    borderTop: '1px solid #eee',
                    bgcolor: '#fff',
                    padding: '5px 0px 20px 0px',
                    '@media (display-mode: standalone)': {
                        '@supports (-webkit-touch-callout: none)': {
                            paddingBottom: 'env(safe-area-inset-bottom)',
                        },
                    },
                }}
                elevation={3}
                className="bottom-navigation"
            >
                <BottomNavigation
                    showLabels
                    value={navigationValue}
                    onChange={(_, newValue) => {
                        if (newValue === 'home') return;
                        switch (newValue) {
                            case 'explore':
                                navigate('/explore');
                                break;
                            case 'create':
                                navigate('/contribution/create');
                                break;
                            case 'projects':
                                navigate('/projects');
                                break;
                            case 'myhub':
                                navigate('/myhub');
                                break;
                            default:
                                break;
                        }
                    }}
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
                    <BottomNavigationAction value="home" onClick={(e) => handleHomeClick(e)} label={t('Home')} icon={<HomeIcon />} />
                    <BottomNavigationAction value="explore" onClick={() => navigate('/explore')} label={t('Explore')} icon={<ExploreIcon />} />
                    <BottomNavigationAction
                        value="create"
                        onClick={() => navigate('/contribution/create')}
                        label={t('Create')}
                        icon={<AddCircleOutlineIcon />}
                    />
                    <BottomNavigationAction value="projects" onClick={() => navigate('/projects')} label={t('Projects')} icon={<FolderIcon />} />
                    <BottomNavigationAction value="myhub" onClick={() => navigate('/myhub')} label={t('My Hub')} icon={<PersonIcon />} />
                </BottomNavigation>
            </Paper>
        </Box>
    );
};

export default Layout;
