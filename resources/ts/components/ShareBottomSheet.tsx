import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FacebookIcon from '@mui/icons-material/Facebook';
import TelegramIcon from '@mui/icons-material/Telegram';
import XIcon from '@mui/icons-material/X';
import { Box, IconButton, InputAdornment, SwipeableDrawer, TextField, Typography } from '@mui/material';
import React, { useRef, useState } from 'react';
import Toast from './Toast';

// TikTok icon as SVG since MUI doesn't have it
const TikTokIcon: React.FC<{ sx?: object }> = ({ sx }) => (
    <Box component="svg" viewBox="0 0 24 24" sx={{ width: 24, height: 24, ...sx }}>
        <path
            fill="currentColor"
            d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
        />
    </Box>
);

interface ShareBottomSheetProps {
    open: boolean;
    onClose: () => void;
    title: string;
    shareUrl: string;
    shareText?: string;
}

interface ShareOption {
    name: string;
    icon: React.ReactNode;
    onClick: () => void;
    bgColor: string;
}

const ShareBottomSheet: React.FC<ShareBottomSheetProps> = ({ open, onClose, title, shareUrl, shareText = '' }) => {
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const [copied, setCopied] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);

    // Copy the URL when clicking the copy button
    const handleCopyClick = () => {
        if (inputRef.current) {
            // Select the text in the input
            inputRef.current.select();
            inputRef.current.setSelectionRange(0, shareUrl.length);

            // Try to copy using execCommand (synchronous, within user gesture)
            try {
                document.execCommand('copy');
                setCopied(true);
                setToastMessage('Link copied!');
                setToastType('success');
                setToastOpen(true);

                // Reset copied state after 2 seconds
                setTimeout(() => setCopied(false), 2000);
            } catch {
                setToastMessage('Please select and copy manually');
                setToastType('error');
                setToastOpen(true);
            }
        }
    };

    // Select all text when clicking the input
    const handleInputClick = () => {
        if (inputRef.current) {
            inputRef.current.select();
            inputRef.current.setSelectionRange(0, shareUrl.length);
        }
    };

    const shareOptions: ShareOption[] = [
        {
            name: 'Facebook',
            icon: <FacebookIcon sx={{ fontSize: 28, color: '#1877F2' }} />,
            onClick: () => {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank', 'noopener,noreferrer');
            },
            bgColor: '#E7F3FF',
        },
        {
            name: 'TikTok',
            icon: <TikTokIcon sx={{ fontSize: 28 }} />,
            onClick: handleCopyClick, // Copy for TikTok since they don't have web share
            bgColor: '#f5f5f5',
        },
        {
            name: 'Telegram',
            icon: <TelegramIcon sx={{ fontSize: 28, color: '#0088CC' }} />,
            onClick: () => {
                window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, '_blank', 'noopener,noreferrer');
            },
            bgColor: '#E3F2FD',
        },
        {
            name: 'X',
            icon: <XIcon sx={{ fontSize: 24, color: '#fff' }} />,
            onClick: () => {
                window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`, '_blank', 'noopener,noreferrer');
            },
            bgColor: '#000',
        },
    ];

    return (
        <>
            <SwipeableDrawer
                anchor="bottom"
                open={open}
                onClose={onClose}
                onOpen={() => {}}
                disableSwipeToOpen
                PaperProps={{
                    sx: {
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        maxHeight: '60vh',
                        pb: 'env(safe-area-inset-bottom)',
                        // Desktop constraints - make it look like a centered frame
                        '@media (min-width: 600px)': {
                            maxWidth: '500px', // Smaller width for desktop popup
                            width: '100%',
                            mx: 'auto',
                            position: 'fixed',
                            bottom: '20px', // Float slightly above bottom
                            left: 0,
                            right: 0,
                            borderRadius: '20px', // Fully rounded on desktop
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        },
                    },
                }}
            >
                {/* Drag handle */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        pt: 1.5,
                        pb: 1,
                    }}
                >
                    <Box
                        sx={{
                            width: 40,
                            height: 4,
                            bgcolor: '#ddd',
                            borderRadius: 2,
                        }}
                    />
                </Box>

                {/* Header */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 2,
                        pb: 2,
                    }}
                >
                    <Box sx={{ width: 32 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center' }}>
                        {title}
                    </Typography>
                    <IconButton size="small" onClick={onClose}>
                        <CloseIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </Box>

                {/* URL Input with Copy Button - YouTube/Facebook style */}
                <Box sx={{ px: 3, pb: 3 }}>
                    <TextField
                        inputRef={inputRef}
                        value={shareUrl}
                        onClick={handleInputClick}
                        fullWidth
                        size="small"
                        InputProps={{
                            readOnly: true,
                            sx: {
                                bgcolor: '#f5f5f5',
                                borderRadius: 2,
                                pr: 0.5,
                                '& .MuiOutlinedInput-notchedOutline': {
                                    border: 'none',
                                },
                            },
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={handleCopyClick}
                                        sx={{
                                            bgcolor: copied ? '#4caf50' : '#1F8505',
                                            color: '#fff',
                                            borderRadius: 1.5,
                                            px: 2,
                                            '&:hover': {
                                                bgcolor: copied ? '#43a047' : '#1a7004',
                                            },
                                        }}
                                    >
                                        {copied ? <CheckIcon sx={{ fontSize: 20 }} /> : <ContentCopyIcon sx={{ fontSize: 20 }} />}
                                        <Typography sx={{ ml: 0.5, fontSize: 14, fontWeight: 500 }}>{copied ? 'Copied!' : 'Copy'}</Typography>
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        inputProps={{
                            style: {
                                fontSize: 14,
                                color: '#666',
                                padding: '12px 14px',
                            },
                        }}
                    />
                </Box>

                {/* Share options */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 3,
                        px: 3,
                        pb: 3,
                    }}
                >
                    {shareOptions.map((option) => (
                        <Box
                            key={option.name}
                            onClick={option.onClick}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1,
                                cursor: 'pointer',
                                minWidth: 60,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: '50%',
                                    bgcolor: option.bgColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'scale(1.1)',
                                    },
                                    '&:active': {
                                        transform: 'scale(0.95)',
                                    },
                                }}
                            >
                                {option.icon}
                            </Box>
                            <Typography
                                sx={{
                                    fontSize: 12,
                                    color: '#666',
                                    textAlign: 'center',
                                }}
                            >
                                {option.name}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                {/* Cancel button */}
                <Box sx={{ px: 3, pb: 3 }}>
                    <Box
                        onClick={onClose}
                        sx={{
                            py: 1.5,
                            bgcolor: '#f5f5f5',
                            borderRadius: 3,
                            textAlign: 'center',
                            cursor: 'pointer',
                            '&:hover': {
                                bgcolor: '#eee',
                            },
                        }}
                    >
                        <Typography sx={{ fontWeight: 500, color: '#333' }}>Cancel</Typography>
                    </Box>
                </Box>
            </SwipeableDrawer>

            <Toast open={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
        </>
    );
};

export default ShareBottomSheet;
