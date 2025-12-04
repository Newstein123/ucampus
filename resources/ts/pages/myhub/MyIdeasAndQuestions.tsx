import { Avatar, List, ListItem, ListItemAvatar, ListItemText, Paper, Typography } from '@mui/material';
import React from 'react';
import SinglePageLayout from '../../components/SinglePageLayout';

const ideas = [
    {
        id: 1,
        title: 'StudySync – A Peer Learning Platform for University Students',
        image: '/assets/images/idea-sample.png',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
        id: 2,
        title: 'CodeSnap – AI-Powered Error Explanation Tool',
        image: '/assets/images/login_cover.png',
        created_at: new Date('2025-06-25'),
    },
    {
        id: 3,
        title: 'EcoRoute – Smart Transport Planner for City Students',
        image: '/assets/images/logo.png',
        created_at: new Date('2025-06-01'),
    },
];

const questions = [
    {
        id: 1,
        title: 'How do I connect a React frontend to a Node.js backend using Express?',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
        id: 2,
        title: 'What’s the best way to structure a large-scale React app with multiple roles?',
        created_at: new Date('2025-06-28'),
    },
];

function formatDate(date: Date): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return '1 day ago';
    if (diff < 7) return `${diff} days ago`;
    return date.toLocaleDateString(undefined, { month: 'long', day: '2-digit', year: 'numeric' });
}

const MyIdeasAndQuestions: React.FC = () => {
    return (
        <SinglePageLayout title="My ideas and questions">
            <Paper elevation={0} sx={{ bgcolor: '#fafdff', borderRadius: 3, p: 0, boxShadow: 'none' }}>
                {/* Section: Ideas */}
                <Typography sx={{ fontWeight: 700, fontSize: 16, px: 2, pt: 2, pb: 1 }}>Ideas</Typography>
                <List sx={{ px: 1 }}>
                    {ideas.map((idea) => (
                        <ListItem
                            key={idea.id}
                            sx={{
                                bgcolor: '#fff',
                                borderRadius: 3,
                                mb: 2,
                                boxShadow: 0,
                                p: 1.5,
                                alignItems: 'flex-start',
                            }}
                        >
                            <ListItemAvatar>
                                <Avatar variant="rounded" src={idea.image} sx={{ width: 56, height: 56, mr: 2, bgcolor: '#e8f5e9' }} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={<Typography sx={{ fontWeight: 700, fontSize: 15, color: '#222' }}>{idea.title}</Typography>}
                                secondary={<Typography sx={{ color: '#aaa', fontSize: 13, mt: 0.5 }}>{formatDate(idea.created_at)}</Typography>}
                            />
                        </ListItem>
                    ))}
                </List>
                {/* Section: Questions */}
                <Typography sx={{ fontWeight: 700, fontSize: 16, px: 2, pt: 1, pb: 1 }}>Questions</Typography>
                <List sx={{ px: 1 }}>
                    {questions.map((q) => (
                        <ListItem
                            key={q.id}
                            sx={{
                                bgcolor: '#fff',
                                borderRadius: 3,
                                mb: 2,
                                boxShadow: 0,
                                p: 1.5,
                                alignItems: 'flex-start',
                            }}
                        >
                            <ListItemAvatar>
                                <Avatar
                                    variant="rounded"
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        mr: 2,
                                        bgcolor: '#e8f5e9',
                                        color: '#1F8505',
                                        fontWeight: 700,
                                        fontSize: 28,
                                    }}
                                >
                                    ?
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={<Typography sx={{ fontWeight: 700, fontSize: 15, color: '#222' }}>{q.title}</Typography>}
                                secondary={<Typography sx={{ color: '#aaa', fontSize: 13, mt: 0.5 }}>{formatDate(q.created_at)}</Typography>}
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </SinglePageLayout>
    );
};

export default MyIdeasAndQuestions;
