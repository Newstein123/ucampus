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
    return (
        <Box sx={{ maxWidth, mx: 'auto', minHeight: '100vh', bgcolor: bgColor, p: 0 }}>
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
            <Box sx={{ bgcolor: contentBgColor, minHeight: 'calc(100vh - 60px)' }}>{children}</Box>
        </Box>
    );
};

export default SinglePageLayout;
