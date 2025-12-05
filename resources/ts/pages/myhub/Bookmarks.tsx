import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Box, CircularProgress, IconButton, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { contributionApi } from '../../api/contribution';
import Layout from '../../components/Layout';

import SinglePageLayout from "../../components/SinglePageLayout";

const DEFAULT_IMAGE = '/assets/images/idea-sample.png';

const Bookmarks: React.FC = () => {
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ['bookmarks'],
        queryFn: () => contributionApi.getBookmarks(),
    });

    const bookmarks = data?.data || [];

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
        <SinglePageLayout title={'Bookmarks'}>
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
                <Box sx={{ px: 2, py: 2 }}>
                    {bookmarks.map((item, index) => (
                        <Box
                            key={item.id}
                            onClick={() => navigate(`/contributions/${item.id}`)}
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                mb: index < bookmarks.length - 1 ? 2.5 : 0,
                                cursor: 'pointer',
                                '&:hover': { opacity: 0.8 }
                            }}
                        >
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
                                        mr: 2
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
                                        mr: 2
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
                                        lineHeight: 1.4
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
        </SinglePageLayout>
    );
};

export default Bookmarks;
