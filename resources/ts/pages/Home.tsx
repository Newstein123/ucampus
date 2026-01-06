import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Avatar, Box, Card, CardContent, CardMedia, CircularProgress, Divider, IconButton, Tab, Tabs, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InfiniteScrollTrigger from '../components/InfiniteScrollTrigger';
import Layout from '../components/Layout';
import { useHomeContext } from '../contexts/HomeContext';
import useContributionBookmarkMutation from '../hooks/contribution/useContributionBookmarkMutation';
import useContributionInterestMutation from '../hooks/contribution/useContributionInterestMutation';
import useContributionListInfiniteQuery from '../hooks/contribution/useContributionListInfiniteQuery';
import { Contribution } from '../types/contribution';

const tabLabels = ['All Contributions', 'Idea', 'Question', 'Project'];

const DEFAULT_IMAGE = '/assets/images/idea-sample.png';

const Home: React.FC = () => {
    const [tab, setTab] = useState(0);
    const type = tab === 0 ? undefined : tabLabels[tab].toLowerCase();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [expandedDescriptions, setExpandedDescriptions] = useState<Set<number>>(new Set());

    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useContributionListInfiniteQuery({ type, perPage: 10 });

    const { onHomeRestart } = useHomeContext();

    // Interest mutation
    const interestMutation = useContributionInterestMutation({
        onSuccess: (data) => {
            console.log('Interest updated successfully:', data.message);
        },
        onError: (error) => {
            console.error('Failed to update interest:', error);
        },
    });

    // Bookmark mutation
    const bookmarkMutation = useContributionBookmarkMutation({
        onSuccess: (data) => {
            console.log('Bookmark updated successfully:', data.message);
        },
        onError: (error) => {
            console.error('Failed to update bookmark:', error);
        },
    });

    // Flatten all pages into a single array
    const contributions = data?.pages.flatMap((page) => page.data) || [];

    const getContributionTitle = (item: Contribution) => {
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

    const getContributionDescription = (item: Contribution) => {
        switch (item?.type) {
            case 'idea':
                return item?.content?.problem;
            case 'question':
                return item?.content?.thought;
            case 'project':
                return item?.content?.description;
            default:
                return item?.content?.description ?? '';
        }
    };

    const countWords = (text: string | undefined): number => {
        if (!text) return 0;
        return text
            .trim()
            .split(/\s+/)
            .filter((word) => word.length > 0).length;
    };

    const getFirstNWords = (text: string | undefined, n: number): string => {
        if (!text) return '';
        const words = text
            .trim()
            .split(/\s+/)
            .filter((word) => word.length > 0);
        return words.slice(0, n).join(' ');
    };

    const toggleDescription = (itemId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedDescriptions((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const handleTabChange = (_: React.SyntheticEvent, idx: number) => {
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

    const handleBookmark = (contributionId: number) => {
        bookmarkMutation.mutate(contributionId);
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

        // For iOS PWA: scroll the main content container, not window
        // The .pwa-main-content element is the actual scrollable container in PWA mode
        const mainContent = document.querySelector('.pwa-main-content');
        if (mainContent) {
            mainContent.scrollTo({ top: 0, behavior: 'smooth' });
        }
        // Also scroll window for non-PWA browsers
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Invalidate and refetch the query to get fresh data
        console.log('Resetting and refetching data...');
        queryClient.resetQueries({ queryKey: ['contributionList', type] });
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
                    <Card
                        key={item.id}
                        onClick={() => navigateToDetails(item.id, item.type)}
                        sx={{
                            mb: 3,
                            boxShadow: 0,
                            borderRadius: 3,
                            bgcolor: '#fff',
                            border: '1px solid #e0e0e0',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                transform: 'translateY(-2px)',
                            },
                        }}
                    >
                        <CardContent sx={{ pb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Avatar sx={{ bgcolor: '#48b74d', width: 32, height: 32, mr: 1 }}>{item?.user?.name?.[0] || 'U'}</Avatar>
                                <Box>
                                    <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{getContributionTitle(item)}</Typography>
                                    <Typography sx={{ color: '#666', fontSize: 12 }}>{item?.user?.name}</Typography>
                                </Box>
                            </Box>
                            {/* Created at time */}
                            <Typography sx={{ color: '#aaa', fontSize: 12, mb: 0.5, ml: 5 }}>{item.created_at}</Typography>
                            {(() => {
                                const description = getContributionDescription(item) || '';
                                const wordCount = countWords(description);
                                const isExpanded = expandedDescriptions.has(item.id);
                                const shouldShowExpand = wordCount > 50;

                                if (!shouldShowExpand) {
                                    return <Typography sx={{ color: '#888', fontSize: 14, mb: 1, whiteSpace: 'pre-wrap' }}>{description}</Typography>;
                                }

                                const displayText = isExpanded ? description : getFirstNWords(description, 50);

                                return (
                                    <Box sx={{ mb: 1 }}>
                                        <Typography sx={{ color: '#888', fontSize: 14, mb: 0.5, whiteSpace: 'pre-wrap' }}>
                                            {displayText}
                                            {!isExpanded && '...'}
                                        </Typography>
                                        <Typography
                                            onClick={(e) => toggleDescription(item.id, e)}
                                            sx={{
                                                color: '#1F8505',
                                                fontWeight: 600,
                                                fontSize: 14,
                                                cursor: 'pointer',
                                                display: 'inline-block',
                                                '&:hover': {
                                                    textDecoration: 'underline',
                                                },
                                            }}
                                        >
                                            {isExpanded ? 'Collapse' : 'Expand'}
                                        </Typography>
                                    </Box>
                                );
                            })()}
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
                        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, pb: 1 }} onClick={(e) => e.stopPropagation()}>
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleInterest(item.id);
                                }}
                                disabled={interestMutation.isPending}
                                sx={{
                                    color: item.is_interested ? '#1F8505' : 'inherit',
                                    '&:hover': {
                                        color: item.is_interested ? '#1F8505' : '#1F8505',
                                    },
                                }}
                            >
                                {item.is_interested ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                            </IconButton>
                            <Typography sx={{ fontSize: 14, mr: 2 }}>{item.likes_count}</Typography>
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigateToDetails(item.id, item.type);
                                }}
                            >
                                <ChatBubbleOutlineIcon fontSize="small" />
                            </IconButton>
                            <Typography sx={{ fontSize: 14, mr: 2 }}>{item.comments_count || 0}</Typography>
                            <Box sx={{ flex: 1 }} />
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleBookmark(item.id);
                                }}
                                disabled={bookmarkMutation.isPending}
                                sx={{
                                    color: item.is_bookmarked ? '#1F8505' : 'inherit',
                                    '&:hover': {
                                        color: item.is_bookmarked ? '#165d04' : '#1F8505',
                                    },
                                }}
                            >
                                {item.is_bookmarked ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
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
