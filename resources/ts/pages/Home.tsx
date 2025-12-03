import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Avatar, Box, Card, CardContent, CardMedia, CircularProgress, Divider, IconButton, Tab, Tabs, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InfiniteScrollTrigger from '../components/InfiniteScrollTrigger';
import Layout from '../components/Layout';
import { useHomeContext } from '../contexts/HomeContext';
import useContributionListInfiniteQuery from '../hooks/contribution/useContributionListInfiniteQuery';
import useContributionInterestMutation from '../hooks/contribution/useContributionInterestMutation';

const tabLabels = ['All Contributions', 'Idea', 'Question'];

const DEFAULT_IMAGE = '/assets/images/idea-sample.png';

const Home: React.FC = () => {
    const [tab, setTab] = useState(0);
    const type = tab === 0 ? undefined : tabLabels[tab].toLowerCase();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } = useContributionListInfiniteQuery({ type, perPage: 10 });

    const { onHomeRestart } = useHomeContext();

    // Interest mutation
    const interestMutation = useContributionInterestMutation({
        onSuccess: (data) => {
            console.log('Interest updated successfully:', data.message);
            // You can add a toast notification here if you have one
        },
        onError: (error) => {
            console.error('Failed to update interest:', error);
            // You can add an error toast notification here
        },
    });

    // Flatten all pages into a single array
    const contributions = data?.pages.flatMap((page) => page.data) || [];

    const getContributionTitle = (item: any) => {
        switch (item?.type) {
            case 'idea':
                return item?.title;
            case 'question':
                return item?.content?.question || item?.title;
            case 'project':
                return item?.title;
            default:
                return item?.title;
        }
    };

    const getContributionDescription = (item: any) => {
        switch (item?.type) {
            case 'idea':
                return item?.content?.description;
            case 'question':
                return item?.content?.answer;
            case 'project':
                return item?.content?.description;
            default:
                return item?.content?.description ?? '';
        }
    };

    const handleTabChange = (_: any, idx: number) => {
        setTab(idx);
    };

    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    const handleInterest = (contributionId: number) => {
        interestMutation.mutate(contributionId);
    };

    const navigateToDetails = (id: number, contributionType: string) => {
        if (contributionType === 'idea') {
            navigate(`/ideas/${id}`);
        } else if (contributionType === 'question') {
            navigate(`/questions/${id}`);
        } else {
            // Fallback to project details if type is project or unknown
            navigate(`/projects/${id}`);
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
        return (
            <Layout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </Box>
            </Layout>
        );
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
                                <Avatar sx={{ bgcolor: '#48b74d', width: 32, height: 32, mr: 1 }}>{item?.user?.name?.[0] || 'U'}</Avatar>
                                <Box>
                                    <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
                                        {getContributionTitle(item)}
                                    </Typography>
                                    <Typography sx={{ color: '#666', fontSize: 12 }}>{item?.user?.name}</Typography>
                                </Box>
                            </Box>
                            {/* Created at time */}
                            <Typography sx={{ color: '#aaa', fontSize: 12, mb: 0.5, ml: 5 }}>{item.created_at}</Typography>
                            <Typography sx={{ color: '#888', fontSize: 14, mb: 1 }}>
                                {getContributionDescription(item)}
                            </Typography>
                        </CardContent>
                        {(item.type === 'idea' || item.type === 'project') && item.thumbnail_url && (
                            <CardMedia
                                component="img"
                                image={item.thumbnail_url}
                                alt={item.title}
                                onError={(e) => {
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
                                    ':hover': { boxShadow: '0 4px 16px 0 rgba(31,133,5,0.16)' },
                                }}
                            />
                        )}
                        {/* Details section under image */}
                        {item.type === 'idea' && (
                            <Box sx={{ px: 1, pb: 1 }}>
                                <Typography
                                    sx={{ color: '#444', fontSize: 14, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                >
                                    {item.content.problem}
                                </Typography>
                                <Typography
                                    sx={{
                                        color: '#1F8505',
                                        fontWeight: 600,
                                        fontSize: 14,
                                        cursor: 'pointer',
                                        display: 'inline-block',
                                        ':hover': { textDecoration: 'underline' },
                                    }}
                                    onClick={() => navigateToDetails(item.id, item.type)}
                                >
                                    ... See details
                                </Typography>
                            </Box>
                        )}
                        {/* Details link for Question type */}
                        {item.type === 'question' && (
                            <Box sx={{ px: 2, pb: 1 }}>
                                <Typography
                                    sx={{
                                        color: '#1F8505',
                                        fontWeight: 600,
                                        fontSize: 14,
                                        cursor: 'pointer',
                                        display: 'inline-block',
                                        ':hover': { textDecoration: 'underline' },
                                    }}
                                    onClick={() => navigateToDetails(item.id, item.type)}
                                >
                                    ... See details
                                </Typography>
                            </Box>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, pb: 1 }}>
                            <IconButton
                                size="small"
                                onClick={() => handleInterest(item.id)}
                                disabled={interestMutation.isPending}
                                sx={{
                                    color: item.is_interested ? '#e91e63' : 'inherit',
                                    '&:hover': {
                                        color: item.is_interested ? '#c2185b' : '#e91e63',
                                    }
                                }}
                            >
                                {item.is_interested ? (
                                    <FavoriteIcon fontSize="small" />
                                ) : (
                                    <FavoriteBorderIcon fontSize="small" />
                                )}
                            </IconButton>
                            <Typography sx={{ fontSize: 14, mr: 2 }}>{item.likes_count}</Typography>
                            <IconButton size="small" onClick={() => navigateToDetails(item.id, item.type)}>
                                <ChatBubbleOutlineIcon fontSize="small" />
                            </IconButton>
                            <Typography sx={{ fontSize: 14, mr: 2 }}>{item.views_count}</Typography>
                            <Box sx={{ flex: 1 }} />
                            <IconButton size="small">
                                <BookmarkBorderIcon fontSize="small" />
                            </IconButton>
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
