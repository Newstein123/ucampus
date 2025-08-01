import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box, Typography, Tabs, Tab, Avatar, Card, CardContent, CardMedia, IconButton, Divider,
    CircularProgress
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import useContributionListInfiniteQuery from '../hooks/contribution/useContributionListInfiniteQuery';
import InfiniteScrollTrigger from '../components/InfiniteScrollTrigger';
import { useHomeContext } from '../contexts/HomeContext';

const tabLabels = ['All Contributions', 'Idea', 'Question'];

const DEFAULT_IMAGE = '/assets/images/idea-sample.png';

const Home: React.FC = () => {
    const [tab, setTab] = useState(0);
    const type = tab === 0 ? undefined : tabLabels[tab].toLowerCase();
    const queryClient = useQueryClient();

    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        refetch
    } = useContributionListInfiniteQuery({ type, perPage: 10 });

    const { onHomeRestart } = useHomeContext();

    // Flatten all pages into a single array
    const contributions = data?.pages.flatMap(page => page.data) || [];

    const handleTabChange = (_: any, idx: number) => {
        setTab(idx);
    };

    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    const handleHomeRestart = useCallback(() => {
        console.log('handleHomeRestart called');

        // Scroll to top of the page
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Invalidate and refetch the query to get fresh data and reset pagination
        console.log('Invalidating and refetching data...');
        queryClient.invalidateQueries({ queryKey: ['contributionList', type] });
    }, [queryClient, type]);

    // Register restart callback
    useEffect(() => {
        console.log('Registering home restart callback');
        onHomeRestart(handleHomeRestart);
    }, [onHomeRestart, handleHomeRestart]);

    if (isLoading) {
        return <Layout>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        </Layout>
    }

    return (
        <Layout>
            {/* Tabs */}
            <Tabs
                value={tab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons={false}
                sx={{ px: 2, mb: 1, '.MuiTabs-indicator': { bgcolor: '#1F8505', height: 3, borderRadius: 2, fontSize: '12px' } }}
            >
                {tabLabels.map((label, idx) => (
                    <Tab
                        key={label}
                        label={<Typography sx={{ fontWeight: tab === idx ? 700 : 500, color: tab === idx ? '#1F8505' : '#888' }}>{label}</Typography>}
                        disableRipple
                        sx={{ minWidth: 120 }}
                    />
                ))}
            </Tabs>
            <Divider />
            {/* Contributions List */}
            <Box sx={{ px: 0, pt: 2 }}>
                {contributions.map((item) => (
                    <Card key={item.id} sx={{ mb: 3, boxShadow: 0, borderRadius: 3, bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                        <CardContent sx={{ pb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Avatar sx={{ bgcolor: '#48b74d', width: 32, height: 32, mr: 1 }}>
                                    {item.user.name[0]}
                                </Avatar>
                                <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{item.type === 'idea' ? item.title : item.content.question}</Typography>
                            </Box>
                            {/* Created at time */}
                            <Typography sx={{ color: '#aaa', fontSize: 12, mb: 0.5, ml: 5 }}>
                                {new Date(item.created_at).toLocaleString()}
                            </Typography>
                            <Typography sx={{ color: '#888', fontSize: 14, mb: 1 }}>{item.type === 'idea' ? item.content.description : item.content.answer}</Typography>
                        </CardContent>
                        {item.type === 'idea' && item.thumbnail_url && (
                            <CardMedia
                                component="img"
                                image={item.thumbnail_url}
                                alt={item.title}
                                onError={e => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = DEFAULT_IMAGE;
                                }}
                                sx={{
                                    width: '100%',
                                    borderRadius: 3,
                                    mb: 1,
                                    maxHeight: 180,
                                    objectFit: 'cover',
                                    border: '2px solid #e8f5e9',
                                    boxShadow: '0 2px 8px 0 rgba(31,133,5,0.08)',
                                    transition: 'box-shadow 0.2s',
                                    ':hover': { boxShadow: '0 4px 16px 0 rgba(31,133,5,0.16)' }
                                }}
                            />
                        )}
                        {/* Details section under image */}
                        {item.type === 'idea' && (
                            <Box sx={{ px: 1, pb: 1 }}>
                                <Typography sx={{ color: '#444', fontSize: 14, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {item.content.problem}
                                </Typography>
                                <Typography
                                    sx={{ color: '#1F8505', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'inline-block', ':hover': { textDecoration: 'underline' } }}
                                >
                                    ... See details
                                </Typography>
                            </Box>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, pb: 1 }}>
                            <IconButton size="small"><FavoriteBorderIcon fontSize="small" /></IconButton>
                            <Typography sx={{ fontSize: 14, mr: 2 }}>{item.likes_count}</Typography>
                            <IconButton size="small"><ChatBubbleOutlineIcon fontSize="small" /></IconButton>
                            <Typography sx={{ fontSize: 14, mr: 2 }}>{item.views_count}</Typography>
                            <Box sx={{ flex: 1 }} />
                            <IconButton size="small"><BookmarkBorderIcon fontSize="small" /></IconButton>
                        </Box>
                    </Card>
                ))}

                {/* Infinite Scroll Trigger */}
                <InfiniteScrollTrigger
                    onIntersect={handleLoadMore}
                    isLoading={isLoading}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                />
            </Box>
        </Layout>
    );
};

export default Home; 