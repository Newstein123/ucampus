import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DownloadIcon from '@mui/icons-material/Download';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import {
    Avatar,
    Box,
    Button,
    CardMedia,
    Chip,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    TextField,
    Typography,
} from '@mui/material';
import React from 'react';
import Layout from '../../components/Layout';

const mockProject = {
    id: 1,
    title: 'StudySync – A Peer Learning Platform for University Students',
    tags: ['#MOBILE APP', '#STUDENT', '#EDUCATION', '#STUDENT LIFE'],
    user: {
        name: 'Ethan Carter',
        avatar: '',
        postedAgo: '2d ago',
    },
    thumbnail: '/assets/images/idea-sample.png',
    description:
        'StudySync is a web-based platform where university students can create and join study groups based on their subjects. It encourages peer-to-peer learning through features like notes, group chats, and scheduled virtual study sessions.',
    problem:
        'Many students struggle with understanding complex topics, especially during exam time. However, asking for help can be intimidating, and not everyone can afford private tutors.',
    solution:
        'StudySync allows students to help each other by forming interest-based groups. They can share learning materials, clarify doubts, and stay motivated together.',
    whoBenefits:
        'University students in any major, especially those in large classrooms or online courses, where personal attention is limited, as it helps introverted students build study relationships at their own pace.',
    resources: ['Frontend: React.js', 'Backend: Firebase / Supabase', 'UI Design: Figma', 'Need 1 frontend dev and 1 UI/UX designer to collaborate'],
    attachments: [
        { name: 'study-sync-wireframes.pdf', url: '#' },
        { name: 'moodboard.fig', url: '#' },
        { name: 'requirements-list.docx', url: '#' },
    ],
    nextSteps: ['Finalize UI wireframes', 'Launch MVP for 1 university by October', 'Collect user feedback and improve'],
    likes: 123,
    comments: 123,
    views: 123,
};

const mockDiscussion = [
    {
        id: 1,
        user: { name: 'Alice', avatar: '' },
        comment: 'This is a great idea! Would love to join as a designer.',
        postedAgo: '1d ago',
    },
    {
        id: 2,
        user: { name: 'Bob', avatar: '' },
        comment: 'Can you share more about the tech stack?',
        postedAgo: '12h ago',
    },
];

const ProjectDetails: React.FC = () => {
    return (
        <Layout>
            <Box sx={{ maxWidth: 600, mx: 'auto', bgcolor: '#f7fafd', minHeight: '100vh', p: 2 }}>
                {/* Tags */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                    {mockProject.tags.map((tag) => (
                        <Chip key={tag} label={tag} sx={{ bgcolor: '#e8f5e9', color: '#1F8505', fontWeight: 600, fontSize: 13 }} />
                    ))}
                </Box>
                {/* Title & Author */}
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.3 }}>
                    {mockProject.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#e8f5e9', mr: 1 }}>{mockProject.user.name[0]}</Avatar>
                    <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: 15 }}>{mockProject.user.name}</Typography>
                        <Typography sx={{ color: '#888', fontSize: 13 }}>{mockProject.user.postedAgo}</Typography>
                    </Box>
                </Box>
                {/* Description */}
                <Typography sx={{ color: '#222', fontSize: 15, mb: 2 }}>{mockProject.description}</Typography>
                {/* Thumbnail */}
                <CardMedia
                    component="img"
                    image={mockProject.thumbnail}
                    alt={mockProject.title}
                    sx={{ width: '100%', borderRadius: 2, mb: 2, maxHeight: 180, objectFit: 'cover' }}
                />
                {/* Problem & Solution */}
                <Box sx={{ border: '1px dashed #b2dfdb', borderRadius: 2, p: 2, mb: 2 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Problem</Typography>
                    <Typography sx={{ color: '#444', fontSize: 14, mb: 1 }}>{mockProject.problem}</Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Solution</Typography>
                    <Typography sx={{ color: '#444', fontSize: 14, mb: 1 }}>{mockProject.solution}</Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Who Benefits</Typography>
                    <Typography sx={{ color: '#444', fontSize: 14 }}>{mockProject.whoBenefits}</Typography>
                </Box>
                {/* Resources */}
                <Box sx={{ border: '1px dashed #b2dfdb', borderRadius: 2, p: 2, mb: 2 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Resources</Typography>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {mockProject.resources.map((r, i) => (
                            <li key={i} style={{ color: '#444', fontSize: 14, marginBottom: 2 }}>
                                {r}
                            </li>
                        ))}
                    </ul>
                </Box>
                {/* Attachments */}
                <Box sx={{ border: '1px dashed #b2dfdb', borderRadius: 2, p: 2, mb: 2 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Attachments</Typography>
                    <List dense>
                        {mockProject.attachments.map((file) => (
                            <ListItem
                                key={file.name}
                                secondaryAction={
                                    <IconButton edge="end" aria-label="download">
                                        <DownloadIcon />
                                    </IconButton>
                                }
                            >
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: '#e8f5e9', color: '#1F8505', width: 32, height: 32 }}>
                                        {file.name.split('.').pop()?.toUpperCase() || 'F'}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={file.name} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
                {/* Next Steps */}
                <Box sx={{ border: '1px dashed #b2dfdb', borderRadius: 2, p: 2, mb: 2 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Next Steps</Typography>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {mockProject.nextSteps.map((step, i) => (
                            <li key={i} style={{ color: '#444', fontSize: 14, marginBottom: 2 }}>
                                {step}
                            </li>
                        ))}
                    </ul>
                </Box>
                {/* Stats */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 1,
                        py: 1,
                        borderRadius: 2,
                        border: '1px solid #e0e0e0',
                        mb: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FavoriteBorderIcon fontSize="small" sx={{ color: '#1F8505' }} />
                        <Typography sx={{ fontSize: 14 }}>{mockProject.likes}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ChatBubbleOutlineIcon fontSize="small" sx={{ color: '#1F8505' }} />
                        <Typography sx={{ fontSize: 14 }}>{mockProject.comments}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: 14, color: '#888' }}>{mockProject.views} views</Typography>
                    </Box>
                </Box>
                {/* Discussion Section */}
                <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, bgcolor: '#fff', mb: 2 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Discussion</Typography>
                    <List>
                        {mockDiscussion.map((d) => (
                            <ListItem key={d.id} alignItems="flex-start">
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: '#e8f5e9', color: '#1F8505', width: 32, height: 32 }}>{d.user.name[0]}</Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                                            {d.user.name} <span style={{ color: '#888', fontWeight: 400, fontSize: 12 }}>· {d.postedAgo}</span>
                                        </Typography>
                                    }
                                    secondary={<Typography sx={{ color: '#444', fontSize: 14 }}>{d.comment}</Typography>}
                                />
                            </ListItem>
                        ))}
                    </List>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#e8f5e9', color: '#1F8505' }}>U</Avatar>
                        <TextField size="small" placeholder="Add a comment..." fullWidth sx={{ bgcolor: '#f7fafd', borderRadius: 2 }} disabled />
                        <Button variant="contained" sx={{ bgcolor: '#1F8505', color: '#fff', borderRadius: 2, fontWeight: 600 }} disabled>
                            Post
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Layout>
    );
};

export default ProjectDetails;
