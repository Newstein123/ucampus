import { Box, Typography } from '@mui/material';
import React, { ReactNode } from 'react';
import BackButton from './BackButton';

interface SinglePageLayoutProps {
    title: string;
    children: ReactNode;
    showBackButton?: boolean;
    onBackClick?: () => void;
    rightElement?: ReactNode;
    bgColor?: string;
    contentBgColor?: string;
    maxWidth?: number;
}

const SinglePageLayout: React.FC<SinglePageLayoutProps> = ({
    title,
    children,
    showBackButton = true,
    onBackClick,
    rightElement,
    bgColor = '#f7fafd',
    contentBgColor = '#fff',
    maxWidth = 600,
}) => {
    // Scroll to hide header logic for PWA
    const [showNavbar, setShowNavbar] = React.useState(true);
    const lastScrollY = React.useRef(0);

    React.useEffect(() => {
        const handleScroll = () => {
            // Only apply in PWA mode
            if (!window.matchMedia('(display-mode: standalone)').matches) return;

            const currentScrollY = window.scrollY;

            // Show navbar at the top or when scrolling up
            if (currentScrollY <= 0) {
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

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <Box
            sx={{
                maxWidth,
                mx: 'auto',
                minHeight: '100vh',
                bgcolor: bgColor,
                p: 0,
                // iOS PWA safe area handling
                '@media (display-mode: standalone)': {
                    '@supports (-webkit-touch-callout: none)': {
                        paddingBottom: 'env(safe-area-inset-bottom)',
                        minHeight: '-webkit-fill-available',
                    },
                },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    pt: 1,
                    pb: 0,
                    position: 'sticky',
                    top: 0,
                    bgcolor: bgColor,
                    zIndex: 10,
                    transition: 'transform 0.3s ease-in-out',
                    transform: showNavbar ? 'translateY(0)' : 'translateY(-100%)',
                    // iOS PWA safe area for header
                    '@media (display-mode: standalone)': {
                        '@supports (-webkit-touch-callout: none)': {
                            paddingTop: 'calc(8px + env(safe-area-inset-top))',
                            position: 'fixed',
                            left: 0,
                            right: 0,
                            margin: '0 auto',
                            width: '100%',
                            maxWidth: 600,
                        },
                    },
                }}
            >
                {showBackButton ? (
                    <BackButton onClick={onBackClick} />
                ) : (
                    <Box sx={{ width: 24 }} /> // Spacer to maintain layout
                )}
                <Typography
                    sx={{
                        fontWeight: 600,
                        fontSize: 16,
                        color: '#222',
                        flex: 1,
                        textAlign: 'center',
                        mr: showBackButton ? 4 : 0,
                    }}
                >
                    {title}
                </Typography>
                {rightElement && <Box sx={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{rightElement}</Box>}
            </Box>

            {/* Content */}
            <Box
                sx={{
                    bgcolor: contentBgColor,
                    minHeight: 'calc(100vh - 60px)',
                    '@media (display-mode: standalone)': {
                        '@supports (-webkit-touch-callout: none)': {
                            paddingTop: 'calc(48px + env(safe-area-inset-top))', // Approx header height
                        },
                    },
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default SinglePageLayout;
