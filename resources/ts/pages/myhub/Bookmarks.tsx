import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogTitle, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contributionApi } from '../../api/contribution';
import SinglePageLayout from '../../components/SinglePageLayout';

const DEFAULT_IMAGE = '/assets/images/idea-sample.png';

const Bookmarks: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Selection mode state
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['bookmarks'],
        queryFn: () => contributionApi.getBookmarks(),
    });

    const bookmarks = data?.data || [];

    // Mutation for unbookmarking multiple items
    const unbookmarkMutation = useMutation({
        mutationFn: async (ids: number[]) => {
            // Unbookmark each selected item
            const promises = ids.map((id) => contributionApi.bookmark(id));
            return Promise.all(promises);
        },
        onSuccess: () => {
            // Invalidate and refetch bookmarks
            queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
            queryClient.invalidateQueries({ queryKey: ['contributionList'] });
            // Reset selection
            setSelectedIds([]);
            setIsSelectMode(false);
            setShowConfirmDialog(false);
        },
        onError: (error) => {
            console.error('Failed to unbookmark:', error);
            setShowConfirmDialog(false);
        },
    });

    const handleSelectToggle = () => {
        if (isSelectMode) {
            // Cancel selection mode
            setSelectedIds([]);
        }
        setIsSelectMode(!isSelectMode);
    };

    const handleItemSelect = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((i) => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleUnbookmark = () => {
        if (selectedIds.length > 0) {
            setShowConfirmDialog(true);
        }
    };

    const handleConfirmUnbookmark = () => {
        unbookmarkMutation.mutate(selectedIds);
    };

    if (isLoading) {
        return (
            <SinglePageLayout title={'Bookmarks'}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress />
                </Box>
            </SinglePageLayout>
        );
    }

    return (
        <SinglePageLayout
            title={'Bookmarks'}
            rightElement={
                bookmarks.length > 0 && (
                    <Typography
                        onClick={handleSelectToggle}
                        sx={{
                            color: '#1F8505',
                            fontWeight: 600,
                            fontSize: 14,
                            marginRight: 3,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {isSelectMode ? 'Cancel' : 'Select'}
                    </Typography>
                )
            }
        >
            {/* Bookmarks List */}
            {bookmarks.length === 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
                    <Typography variant="h6" sx={{ color: '#888', fontWeight: 600 }}>
                        No bookmarks yet
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#aaa', mt: 1 }}>
                        Bookmark contributions to save them here
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ px: 2, py: 2, pb: isSelectMode ? 10 : 2 }}>
                    {bookmarks.map((item, index) => (
                        <Box
                            key={item.id}
                            onClick={() => {
                                if (isSelectMode) {
                                    handleItemSelect(item.id);
                                } else {
                                    navigate(`/contributions/${item.id}`);
                                }
                            }}
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                mb: index < bookmarks.length - 1 ? 2.5 : 0,
                                cursor: 'pointer',
                                '&:hover': { opacity: 0.8 },
                            }}
                        >
                            {/* Checkbox in select mode */}
                            {isSelectMode && (
                                <Box sx={{ mr: 1.5, display: 'flex', alignItems: 'center', pt: 1.5 }}>
                                    {selectedIds.includes(item.id) ? (
                                        <CheckCircleIcon sx={{ color: '#1F8505', fontSize: 24 }} />
                                    ) : (
                                        <RadioButtonUncheckedIcon sx={{ color: '#ccc', fontSize: 24 }} />
                                    )}
                                </Box>
                            )}

                            {/* Thumbnail or Question Icon */}
                            {item.type === 'question' ? (
                                <Box
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: 2,
                                        bgcolor: '#f5f5f5',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        mr: 2,
                                    }}
                                >
                                    <HelpOutlineIcon sx={{ fontSize: 30, color: '#666' }} />
                                </Box>
                            ) : (
                                <Box
                                    component="img"
                                    src={item.thumbnail_url || DEFAULT_IMAGE}
                                    onError={(e) => {
                                        e.currentTarget.src = DEFAULT_IMAGE;
                                    }}
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: 2,
                                        objectFit: 'cover',
                                        flexShrink: 0,
                                        mr: 2,
                                    }}
                                />
                            )}

                            {/* Content */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: 15,
                                        color: '#000',
                                        mb: 0.5,
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {item.title}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: 13,
                                        color: '#999',
                                    }}
                                >
                                    {item.created_at}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}

            {/* Unbookmark Button - Fixed at bottom */}
            {isSelectMode && (
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 2,
                        bgcolor: '#fff',
                        borderTop: '1px solid #eee',
                        maxWidth: 600,
                        mx: 'auto',
                    }}
                >
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={handleUnbookmark}
                        disabled={selectedIds.length === 0 || unbookmarkMutation.isPending}
                        sx={{
                            borderColor: selectedIds.length > 0 ? '#1F8505' : '#ccc',
                            color: selectedIds.length > 0 ? '#1F8505' : '#999',
                            fontWeight: 600,
                            py: 1.5,
                            borderRadius: 3,
                            textTransform: 'none',
                            fontSize: 16,
                            '&:hover': {
                                borderColor: '#1F8505',
                                bgcolor: 'rgba(31, 133, 5, 0.04)',
                            },
                        }}
                    >
                        {unbookmarkMutation.isPending ? <CircularProgress size={24} /> : 'Unbookmark'}
                    </Button>
                </Box>
            )}

            {/* Confirmation Dialog */}
            <Dialog
                open={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        p: 1,
                        minWidth: 300,
                    },
                }}
            >
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 600, pb: 1 }}>Selected items will be removed from bookmark!</DialogTitle>
                <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
                    <Button
                        onClick={handleConfirmUnbookmark}
                        disabled={unbookmarkMutation.isPending}
                        sx={{
                            bgcolor: '#1F8505',
                            color: '#fff',
                            minWidth: 100,
                            py: 1,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                                bgcolor: '#165d04',
                            },
                        }}
                    >
                        {unbookmarkMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Sure'}
                    </Button>
                    <Button
                        onClick={() => setShowConfirmDialog(false)}
                        variant="outlined"
                        sx={{
                            borderColor: '#1F8505',
                            color: '#1F8505',
                            minWidth: 100,
                            py: 1,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                                borderColor: '#165d04',
                                bgcolor: 'rgba(31, 133, 5, 0.04)',
                            },
                        }}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </SinglePageLayout>
    );
};

export default Bookmarks;
