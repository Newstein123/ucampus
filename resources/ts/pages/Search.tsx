import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FilterListIcon from '@mui/icons-material/FilterList';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import {
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    CircularProgress,
    FormControlLabel,
    IconButton,
    InputBase,
    Menu,
    MenuItem,
    Paper,
    Radio,
    RadioGroup,
    Tooltip,
    Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import Layout from '../components/Layout';
import useContributionBookmarkMutation from '../hooks/contribution/useContributionBookmarkMutation';
import useContributionInterestMutation from '../hooks/contribution/useContributionInterestMutation';
import useContributionSearchQuery from '../hooks/contribution/useContributionSearchQuery';
import { Contribution, ContributionResponse } from '../types/contribution';

const DEFAULT_IMAGE = '/assets/images/idea-sample.png';

type SortOption = 'latest' | 'oldest' | 'most_liked' | 'most_viewed' | 'most_commented';
type FilterType = 'idea' | 'question' | 'project';

/**
 * Highlights matching text in a string based on search query
 * Supports both single word and multiple word searches
 * @param text - The text to highlight
 * @param query - The search query to highlight
 * @returns JSX element with highlighted text
 */
const highlightText = (text: string | null | undefined, query: string): React.ReactNode => {
    if (!text || !query.trim()) {
        return text || '';
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length === 0) {
        return text;
    }

    // Split query into individual words (preserving the original query for phrase matching)
    const words = trimmedQuery.split(/\s+/).filter((word) => word.length > 0);

    // Escape special regex characters
    const escapedWords = words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    // Create a regex pattern that matches any of the words (case-insensitive)
    const pattern = new RegExp(`(${escapedWords.join('|')})`, 'gi');
    const parts = text.split(pattern);

    return (
        <>
            {parts.map((part, index) => {
                // Check if this part matches any of the search words (case-insensitive)
                const isMatch = words.some((word) => part.toLowerCase() === word.toLowerCase());
                if (isMatch) {
                    return (
                        <span key={index} style={{ backgroundColor: '#fff176', fontWeight: 600, color: '#333' }}>
                            {part}
                        </span>
                    );
                }
                return <span key={index}>{part}</span>;
            })}
        </>
    );
};

const Search: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const [sortAnchor, setSortAnchor] = useState<null | HTMLElement>(null);
    const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);

    // Initialize state from URL params
    const q = searchParams.get('q') || '';
    const [searchQuery, setSearchQuery] = useState(q);
    const [sortOption, setSortOption] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'latest');
    const [filterTypes, setFilterTypes] = useState<FilterType[]>(() => {
        const typeParam = searchParams.get('type');
        if (typeParam) {
            return [typeParam as FilterType];
        }
        return ['idea', 'question', 'project'];
    });

    // Update search query when URL param changes
    useEffect(() => {
        setSearchQuery(q);
    }, [q]);

    // API only supports single type, so if multiple types are selected, don't filter by type
    const type = filterTypes.length === 1 ? filterTypes[0] : undefined;

    const { data: searchData, isLoading } = useContributionSearchQuery({
        q: q || undefined,
        type: type,
        sort: sortOption,
        per_page: 20,
        page: 1,
    });

    const contributions = searchData?.data || [];

    // Interest mutation
    const interestMutation = useContributionInterestMutation({
        onSuccess: () => {
            // Refetch search results to update like counts
        },
        onError: (error) => {
            console.error('Failed to update interest:', error);
        },
    });

    // Bookmark mutation
    const bookmarkMutation = useContributionBookmarkMutation({
        onError: (error) => {
            console.error('Failed to update bookmark:', error);
        },
    });

    useEffect(() => {
        // Update URL params when filters change
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (sortOption !== 'latest') params.set('sort', sortOption);
        if (filterTypes.length === 1) {
            params.set('type', filterTypes[0]);
        }
        setSearchParams(params, { replace: true });
    }, [q, sortOption, filterTypes, setSearchParams]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            const params = new URLSearchParams();
            params.set('q', searchQuery.trim());
            if (sortOption !== 'latest') params.set('sort', sortOption);
            if (filterTypes.length === 1) {
                params.set('type', filterTypes[0]);
            }
            setSearchParams(params, { replace: true });
        }
    };

    const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
        setSortAnchor(event.currentTarget);
    };

    const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
        setFilterAnchor(event.currentTarget);
    };

    const handleSortClose = () => {
        setSortAnchor(null);
    };

    const handleFilterClose = () => {
        setFilterAnchor(null);
    };

    const handleSortChange = (option: SortOption) => {
        setSortOption(option);
        handleSortClose();
    };

    const handleFilterChange = (type: FilterType) => {
        setFilterTypes((prev) => {
            if (prev.includes(type)) {
                const newTypes = prev.filter((t) => t !== type);
                return newTypes.length > 0 ? newTypes : ['idea', 'question', 'project'];
            } else {
                return [...prev, type];
            }
        });
    };

    const handleInterest = (contributionId: number) => {
        interestMutation.mutate(contributionId);
    };

    const handleBookmark = (contributionId: number) => {
        // Optimistically update the search cache before the mutation
        queryClient.setQueriesData({ queryKey: ['contributionSearch'], exact: false }, (oldData: ContributionResponse | undefined) => {
            if (!oldData?.data) return oldData;
            return {
                ...oldData,
                data: oldData.data.map((contribution: Contribution) =>
                    contribution.id === contributionId ? { ...contribution, is_bookmarked: !contribution.is_bookmarked } : contribution,
                ),
            };
        });

        bookmarkMutation.mutate(contributionId, {
            onSuccess: (data) => {
                // Update with server response
                queryClient.setQueriesData({ queryKey: ['contributionSearch'], exact: false }, (oldData: ContributionResponse | undefined) => {
                    if (!oldData?.data) return oldData;
                    return {
                        ...oldData,
                        data: oldData.data.map((contribution: Contribution) =>
                            contribution.id === contributionId ? { ...contribution, is_bookmarked: data.data.is_bookmarked } : contribution,
                        ),
                    };
                });
            },
            onError: () => {
                // Rollback on error by invalidating
                queryClient.invalidateQueries({ queryKey: ['contributionSearch'], exact: false });
            },
        });
    };

    const navigateToDetails = (id: number, contributionType: string) => {
        if (contributionType === 'idea') {
            navigate(`/ideas/${id}`);
        } else if (contributionType === 'question') {
            navigate(`/questions/${id}`);
        } else {
            navigate(`/projects/${id}`);
        }
    };

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
                return item?.content?.description;
            case 'question':
                return item?.content?.answer;
            case 'project':
                return item?.content?.description;
            default:
                return item?.content?.description ?? '';
        }
    };

    const getContributionIcon = (type: string) => {
        switch (type) {
            case 'question':
                return <HelpOutlineIcon sx={{ fontSize: 24, color: '#666' }} />;
            case 'idea':
                return <LightbulbIcon sx={{ fontSize: 24, color: '#666' }} />;
            default:
                return null;
        }
    };

    return (
        <Layout>
            {/* Header with Back Button */}
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, mb: 2 }}>
                <BackButton />
                <Typography sx={{ fontWeight: 700, fontSize: 18, flex: 1 }}>Search results</Typography>
            </Box>

            {/* Search Bar */}
            <Paper
                component="form"
                onSubmit={handleSearch}
                sx={{ display: 'flex', alignItems: 'center', px: 2, py: 0.5, mb: 2, mx: 2, borderRadius: 2, bgcolor: '#f5f6fa', boxShadow: 0 }}
            >
                <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    placeholder="Search"
                    inputProps={{ 'aria-label': 'search' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
                    <SearchIcon />
                </IconButton>
            </Paper>

            {/* Sort and Filter Buttons */}
            <Box sx={{ display: 'flex', gap: 1, px: 2, mb: 2 }}>
                <Button
                    variant={sortAnchor ? 'contained' : 'outlined'}
                    startIcon={<SortIcon />}
                    endIcon={sortAnchor ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                    onClick={handleSortClick}
                    sx={{
                        flex: 1,
                        textTransform: 'none',
                        borderColor: '#e0e0e0',
                        color: sortAnchor ? '#fff' : '#333',
                        bgcolor: sortAnchor ? '#1F8505' : 'transparent',
                        '&:hover': {
                            bgcolor: sortAnchor ? '#156c0c' : '#f5f5f5',
                            borderColor: '#1F8505',
                        },
                    }}
                >
                    Sort
                </Button>
                <Button
                    variant={filterAnchor ? 'contained' : 'outlined'}
                    startIcon={<FilterListIcon />}
                    endIcon={filterAnchor ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                    onClick={handleFilterClick}
                    sx={{
                        flex: 1,
                        textTransform: 'none',
                        borderColor: '#e0e0e0',
                        color: filterAnchor ? '#fff' : '#333',
                        bgcolor: filterAnchor ? '#1F8505' : 'transparent',
                        '&:hover': {
                            bgcolor: filterAnchor ? '#156c0c' : '#f5f5f5',
                            borderColor: '#1F8505',
                        },
                    }}
                >
                    Filter
                </Button>
            </Box>

            {/* Sort Menu */}
            <Menu anchorEl={sortAnchor} open={Boolean(sortAnchor)} onClose={handleSortClose}>
                <RadioGroup value={sortOption} onChange={(e) => handleSortChange(e.target.value as SortOption)}>
                    <MenuItem onClick={() => handleSortChange('latest')}>
                        <FormControlLabel value="latest" control={<Radio />} label="Newest to Oldest" />
                    </MenuItem>
                    <MenuItem onClick={() => handleSortChange('oldest')}>
                        <FormControlLabel value="oldest" control={<Radio />} label="Oldest to Newest" />
                    </MenuItem>
                </RadioGroup>
            </Menu>

            {/* Filter Menu */}
            <Menu anchorEl={filterAnchor} open={Boolean(filterAnchor)} onClose={handleFilterClose}>
                <MenuItem>
                    <FormControlLabel
                        control={<Checkbox checked={filterTypes.includes('question')} onChange={() => handleFilterChange('question')} />}
                        label="Questions"
                    />
                </MenuItem>
                <MenuItem>
                    <FormControlLabel
                        control={<Checkbox checked={filterTypes.includes('idea')} onChange={() => handleFilterChange('idea')} />}
                        label="Ideas"
                    />
                </MenuItem>
                <MenuItem>
                    <FormControlLabel
                        control={<Checkbox checked={filterTypes.includes('project')} onChange={() => handleFilterChange('project')} />}
                        label="Projects"
                    />
                </MenuItem>
            </Menu>

            {/* Search Results */}
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={32} sx={{ color: '#1F8505' }} />
                </Box>
            ) : contributions.length > 0 ? (
                <Box sx={{ px: 2, pb: 4 }}>
                    {contributions.map((item) => (
                        <Card
                            key={item.id}
                            onClick={() => navigateToDetails(item.id, item.type)}
                            sx={{
                                mb: 2,
                                borderRadius: 3,
                                bgcolor: '#fff',
                                border: '1px solid #e0e0e0',
                                boxShadow: 0,
                                cursor: 'pointer',
                                '&:hover': {
                                    boxShadow: 2,
                                },
                            }}
                        >
                            <CardContent sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    {/* Icon or Thumbnail */}
                                    {item.type === 'question' || item.type === 'idea' ? (
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
                                            }}
                                        >
                                            {getContributionIcon(item.type)}
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
                                            }}
                                        />
                                    )}

                                    {/* Content */}
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.5 }}>
                                            {highlightText(getContributionTitle(item), q)}
                                        </Typography>
                                        <Typography sx={{ color: '#888', fontSize: 13, mb: 1 }} noWrap>
                                            {highlightText(getContributionDescription(item), q)}
                                        </Typography>

                                        {/* Actions */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleInterest(item.id);
                                                    }}
                                                    sx={{ p: 0.5 }}
                                                >
                                                    {item.is_interested ? (
                                                        <FavoriteIcon sx={{ fontSize: 18, color: '#1F8505' }} />
                                                    ) : (
                                                        <FavoriteBorderIcon sx={{ fontSize: 18, color: '#666' }} />
                                                    )}
                                                </IconButton>
                                                <Typography sx={{ fontSize: 12, color: '#666' }}>{item.likes_count}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <ChatBubbleOutlineIcon sx={{ fontSize: 18, color: '#666' }} />
                                                <Typography sx={{ fontSize: 12, color: '#666' }}>{item.comments_count}</Typography>
                                            </Box>
                                            <Box sx={{ flex: 1 }} />
                                            <Tooltip title={item.is_bookmarked ? 'Remove bookmark' : 'Bookmark'} arrow>
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
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            ) : (
                <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
                    <Typography sx={{ color: '#888', fontSize: 14 }}>No results found</Typography>
                </Box>
            )}
        </Layout>
    );
};

export default Search;
