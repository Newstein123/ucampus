import SearchIcon from '@mui/icons-material/Search';
import { Box, Card, CardContent, CardMedia, Chip, CircularProgress, IconButton, InputBase, Paper, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useTagSearchQuery, useTrendingTagsQuery } from '../hooks';
import useContributionTrendingQuery from '../hooks/contribution/useContributionTrendingQuery';
import { Contribution } from '../types/contribution';

const DEFAULT_IMAGE = '/assets/images/idea-sample.png';

const Explore: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [tagSearchQuery, setTagSearchQuery] = useState('');

    // Fetch trending ideas (5 items)
    const { data: trendingIdeasData, isLoading: isLoadingIdeas } = useContributionTrendingQuery({
        type: 'idea',
        per_page: 5,
        page: 1,
    });

    // Fetch trending questions (5 items)
    const { data: trendingQuestionsData, isLoading: isLoadingQuestions } = useContributionTrendingQuery({
        type: 'question',
        per_page: 5,
        page: 1,
    });

    // Fetch trending tags
    const { data: trendingTagsData, isLoading: isLoadingTags } = useTrendingTagsQuery(10);
    const trendingTags = trendingTagsData?.data || [];

    // Fetch tag search results
    const { data: tagSearchData, isLoading: isLoadingTagSearch } = useTagSearchQuery(tagSearchQuery, 20, tagSearchQuery.trim().length > 0);
    const tagSearchResults = tagSearchData?.data || [];

    const trendingIdeas = trendingIdeasData?.data || [];
    const trendingQuestions = trendingQuestionsData?.data || [];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleTagClick = (tagName: string) => {
        navigate(`/search?q=${encodeURIComponent(tagName)}&type=tag`);
    };

    const getIdeaDescription = (item: Contribution) => {
        return item?.content?.description || '';
    };

    const getQuestionTitle = (item: Contribution) => {
        return item?.content?.question || item?.title;
    };

    const getQuestionDescription = (item: Contribution) => {
        return item?.content?.answer || '';
    };

    const navigateToIdea = (slug: string) => {
        navigate(`/ideas/${slug}`);
    };

    const navigateToQuestion = (slug: string) => {
        navigate(`/questions/${slug}`);
    };

    return (
        <Layout>
            {/* Search */}
            <Paper
                component="form"
                onSubmit={handleSearch}
                sx={{ display: 'flex', alignItems: 'center', px: 2, py: 0.5, mb: 2, borderRadius: 2, bgcolor: '#f5f6fa', boxShadow: 0 }}
            >
                <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    placeholder="Search"
                    inputProps={{ 'aria-label': 'search' }}
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setTagSearchQuery(e.target.value);
                    }}
                />
                <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
                    <SearchIcon />
                </IconButton>
            </Paper>
            {/* Tag Search Results */}
            {tagSearchQuery.trim().length > 0 && (
                <Box sx={{ px: 2, mb: 2 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 1 }}>Tag Search Results</Typography>
                    {isLoadingTagSearch ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <CircularProgress size={24} sx={{ color: '#1F8505' }} />
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {tagSearchResults.length > 0 ? (
                                tagSearchResults.map((tag) => (
                                    <Chip
                                        key={tag.id}
                                        label={`#${tag.name.toUpperCase()}`}
                                        onClick={() => handleTagClick(tag.name)}
                                        sx={{
                                            bgcolor: '#e8f5e9',
                                            color: '#1F8505',
                                            fontWeight: 600,
                                            fontSize: 14,
                                            cursor: 'pointer',
                                            '&:hover': {
                                                bgcolor: '#c8e6c9',
                                            },
                                        }}
                                    />
                                ))
                            ) : (
                                <Typography sx={{ color: '#888', fontSize: 14, py: 1 }}>No tags found</Typography>
                            )}
                        </Box>
                    )}
                </Box>
            )}
            {/* Trending Tags */}
            <Box sx={{ px: 2, mb: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 1 }}>Trending Tags</Typography>
                {isLoadingTags ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <CircularProgress size={24} sx={{ color: '#1F8505' }} />
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {trendingTags.length > 0 ? (
                            trendingTags.map((tag) => (
                                <Chip
                                    key={tag.id}
                                    label={`#${tag.name.toUpperCase()}`}
                                    onClick={() => handleTagClick(tag.name)}
                                    sx={{
                                        bgcolor: '#e8f5e9',
                                        color: '#1F8505',
                                        fontWeight: 600,
                                        fontSize: 14,
                                        cursor: 'pointer',
                                        '&:hover': {
                                            bgcolor: '#c8e6c9',
                                        },
                                    }}
                                />
                            ))
                        ) : (
                            <Typography sx={{ color: '#888', fontSize: 14, py: 1 }}>No trending tags found</Typography>
                        )}
                    </Box>
                )}
            </Box>
            {/* Trending Ideas */}
            <Box sx={{ px: 2, mb: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 1 }}>Trending Ideas</Typography>
                {isLoadingIdeas ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                        <CircularProgress size={24} sx={{ color: '#1F8505' }} />
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, pb: 1 }}>
                        {trendingIdeas.length > 0 ? (
                            trendingIdeas.map((idea) => (
                                <Card
                                    key={idea.id}
                                    onClick={() => navigateToIdea(idea.slug)}
                                    sx={{
                                        minWidth: 240,
                                        maxWidth: 260,
                                        boxShadow: 0,
                                        borderRadius: 3,
                                        bgcolor: '#fff',
                                        border: '1px solid #e0e0e0',
                                        position: 'relative',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        image={idea.thumbnail_url || DEFAULT_IMAGE}
                                        alt={idea.title}
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = DEFAULT_IMAGE;
                                        }}
                                        sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 2 }}
                                    />
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 10,
                                            right: 10,
                                            bgcolor: '#1F8505',
                                            color: '#fff',
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 2,
                                            fontSize: 12,
                                            fontWeight: 700,
                                        }}
                                    >
                                        TRENDING
                                    </Box>
                                    <CardContent sx={{ pb: 1 }}>
                                        <Typography
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: 15,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {idea.title}
                                        </Typography>
                                        <Typography sx={{ color: '#888', fontSize: 13 }}>{getIdeaDescription(idea)}</Typography>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Typography sx={{ color: '#888', fontSize: 14, py: 2 }}>No trending ideas found</Typography>
                        )}
                    </Box>
                )}
            </Box>
            {/* Trending Questions */}
            <Box sx={{ px: 2, mb: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 1 }}>Trending Questions</Typography>
                {isLoadingQuestions ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                        <CircularProgress size={24} sx={{ color: '#1F8505' }} />
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {trendingQuestions.length > 0 ? (
                            trendingQuestions.map((q) => (
                                <Paper
                                    key={q.id}
                                    onClick={() => navigateToQuestion(q.slug)}
                                    sx={{
                                        p: 2,
                                        borderRadius: 3,
                                        bgcolor: '#fff',
                                        border: '1px solid #e0e0e0',
                                        boxShadow: 0,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.5 }}>{getQuestionTitle(q)}</Typography>
                                    <Typography sx={{ color: '#888', fontSize: 13 }}>{getQuestionDescription(q)}</Typography>
                                </Paper>
                            ))
                        ) : (
                            <Typography sx={{ color: '#888', fontSize: 14, py: 2 }}>No trending questions found</Typography>
                        )}
                    </Box>
                )}
            </Box>
        </Layout>
    );
};

export default Explore;
