import React, { useState } from 'react';
import {
    Box, Typography, Avatar, Badge, IconButton, InputBase, Paper, Chip, Card, CardContent, CardMedia, Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Layout from '../components/Layout';

const trendingTags = [
    '#EDUCATION', '#TECHNOLOGY', '#CULTURE', '#INNOVATION', '#COMMUNITY'
];

const latestIdeas = [
    {
        title: 'Empowering Youth Through Education',
        desc: 'Explore educational resources and opportunities.',
        image: '/assets/images/idea-sample.png',
        trending: true,
    },
    {
        title: 'Tech for Good',
        desc: 'Discover how technology is driving innovation.',
        image: '/assets/images/idea-sample.png',
        trending: false,
    },
];

const trendingQuestions = [
    {
        title: 'How can we preserve traditional arts?',
        desc: 'Share your thoughts on supporting Myanmar arts and crafts.'
    },
    {
        title: 'What are the best ways to learn coding?',
        desc: 'Tips and resources for beginners.'
    },
];

const Explore: React.FC = () => {
    return (
        <Layout>
            {/* Search */}
            <Paper
                sx={{ display: 'flex', alignItems: 'center', px: 2, py: 0.5, mb: 2, borderRadius: 2, bgcolor: '#f5f6fa', boxShadow: 0 }}
            >
                <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    placeholder="Search"
                    inputProps={{ 'aria-label': 'search' }}
                />
                <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                    <SearchIcon />
                </IconButton>
            </Paper>
            {/* Trending Tags */}
            <Box sx={{ px: 2, mb: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 1 }}>Trending Tags</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {trendingTags.map(tag => (
                        <Chip key={tag} label={tag} sx={{ bgcolor: '#e8f5e9', color: '#1F8505', fontWeight: 600, fontSize: 14 }} />
                    ))}
                </Box>
            </Box>
            {/* Latest Ideas */}
            <Box sx={{ px: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 16, flex: 1 }}>Latest IDEAs</Typography>
                    <Button size="small" sx={{ color: '#1F8505', fontWeight: 600, textTransform: 'none' }}>See more</Button>
                </Box>
                <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2 }}>
                    {latestIdeas.map((idea, idx) => (
                        <Card key={idx} sx={{ minWidth: 240, maxWidth: 260, boxShadow: 0, borderRadius: 3, bgcolor: '#fff', border: '1px solid #e0e0e0', position: 'relative' }}>
                            <CardMedia
                                component="img"
                                image={idea.image}
                                alt={idea.title}
                                sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 2 }}
                            />
                            {idea.trending && (
                                <Box sx={{ position: 'absolute', top: 10, right: 10, bgcolor: '#1F8505', color: '#fff', px: 1.5, py: 0.5, borderRadius: 2, fontSize: 12, fontWeight: 700 }}>
                                    TRENDING
                                </Box>
                            )}
                            <CardContent sx={{ pb: 1 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{idea.title}</Typography>
                                <Typography sx={{ color: '#888', fontSize: 13 }}>{idea.desc}</Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </Box>
            {/* Trending Questions */}
            <Box sx={{ px: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 16, flex: 1 }}>Trending Questions</Typography>
                    <Button size="small" sx={{ color: '#1F8505', fontWeight: 600, textTransform: 'none' }}>See more</Button>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {trendingQuestions.map((q, idx) => (
                        <Paper key={idx} sx={{ p: 2, borderRadius: 3, bgcolor: '#fff', border: '1px solid #e0e0e0', boxShadow: 0 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.5 }}>{q.title}</Typography>
                            <Typography sx={{ color: '#888', fontSize: 13 }}>{q.desc}</Typography>
                        </Paper>
                    ))}
                </Box>
            </Box>
        </Layout>
    );
};

export default Explore; 