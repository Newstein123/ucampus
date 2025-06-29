import React, { useState } from 'react';
import {
    Box, Typography, Tabs, Tab, Avatar, Badge, Card, CardContent, CardMedia, IconButton, Divider
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import QuestionMarkOutlinedIcon from '@mui/icons-material/QuestionMarkOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import Layout from '../components/Layout';

const contributions = [
    {
        type: 'idea',
        title: 'Empowering Youth Through Tech',
        desc: 'A new initiative to provide tech skills training for young people in Yangon.',
        image: '/assets/images/idea-sample.png',
        likes: 123,
        comments: 123,
        icon: <InfoOutlinedIcon sx={{ color: '#1F8505' }} />,
    },
    {
        type: 'question',
        title: 'Preserving Traditional Arts?',
        desc: 'Efforts to support and promote traditional Myanmar arts and crafts.',
        image: '',
        likes: 123,
        comments: 123,
        icon: <QuestionMarkOutlinedIcon sx={{ color: '#1F8505' }} />,
    },
    {
        type: 'idea',
        title: 'Empowering Youth Through Tech',
        desc: 'A new initiative to provide tech skills training for young people in Yangon.',
        image: '/assets/images/idea-sample.png',
        likes: 123,
        comments: 123,
        icon: <InfoOutlinedIcon sx={{ color: '#1F8505' }} />,
    },
    {
        type: 'question',
        title: 'Preserving Traditional Arts?',
        desc: 'Efforts to support and promote traditional Myanmar arts and crafts.',
        image: '',
        likes: 123,
        comments: 123,
        icon: <QuestionMarkOutlinedIcon sx={{ color: '#1F8505' }} />,
    },
    {
        type: 'idea',
        title: 'Empowering Youth Through Tech',
        desc: 'A new initiative to provide tech skills training for young people in Yangon.',
        image: '/assets/images/idea-sample.png',
        likes: 123,
        comments: 123,
        icon: <InfoOutlinedIcon sx={{ color: '#1F8505' }} />,
    },
    {
        type: 'question',
        title: 'Preserving Traditional Arts?',
        desc: 'Efforts to support and promote traditional Myanmar arts and crafts.',
        image: '',
        likes: 123,
        comments: 123,
        icon: <QuestionMarkOutlinedIcon sx={{ color: '#1F8505' }} />,
    },
];

const tabLabels = ['All Contributions', 'Ideas', 'Questions', 'Projects'];

const Home: React.FC = () => {
    const [tab, setTab] = useState(0);

    return (
        <Layout>
            {/* Tabs */}
            <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
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
            <Box sx={{ px: 2, pt: 2 }}>
                {contributions.map((item, idx) => (
                    <Card key={idx} sx={{ mb: 3, boxShadow: 0, borderRadius: 3, bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                        <CardContent sx={{ pb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Avatar sx={{ bgcolor: '#e8f5e9', width: 32, height: 32, mr: 1 }}>
                                    {item.icon}
                                </Avatar>
                                <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{item.title}</Typography>
                            </Box>
                            <Typography sx={{ color: '#888', fontSize: 14, mb: 1 }}>{item.desc}</Typography>
                        </CardContent>
                        {item.image && (
                            <CardMedia
                                component="img"
                                image={item.image}
                                alt={item.title}
                                sx={{ width: '100%', borderRadius: 2, mb: 1, maxHeight: 180, objectFit: 'cover' }}
                            />
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, pb: 1 }}>
                            <IconButton size="small"><FavoriteBorderIcon fontSize="small" /></IconButton>
                            <Typography sx={{ fontSize: 14, mr: 2 }}>{item.likes}</Typography>
                            <IconButton size="small"><ChatBubbleOutlineIcon fontSize="small" /></IconButton>
                            <Typography sx={{ fontSize: 14, mr: 2 }}>{item.comments}</Typography>
                            <Box sx={{ flex: 1 }} />
                            <IconButton size="small"><BookmarkBorderIcon fontSize="small" /></IconButton>
                        </Box>
                    </Card>
                ))}
            </Box>
        </Layout>
    );
};

export default Home; 