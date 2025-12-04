import BookmarkIcon from '@mui/icons-material/Bookmark';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DownloadIcon from '@mui/icons-material/Download';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import MailIcon from '@mui/icons-material/Mail';
import SendIcon from '@mui/icons-material/Send';
import VisibilityIcon from '@mui/icons-material/Visibility';
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
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import SinglePageLayout from '../../components/SinglePageLayout';

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
    teamMembers: [
        { name: 'Adom Shafi', avatar: '', role: 'Frontend Developer' },
        { name: 'Sarah Chen', avatar: '', role: 'UI/UX Designer' },
        { name: 'Mike Johnson', avatar: '', role: 'Backend Developer' },
        { name: 'Lisa Wang', avatar: '', role: 'Product Manager' },
    ],
};

const mockDiscussion = [
    {
        id: 1,
        user: { name: 'Adom Shafi', avatar: '' },
        comment: 'This is a great idea! Would love to join as a designer. The concept of peer-to-peer learning really resonates with me.',
        postedAgo: '2d ago',
        likes: 124,
        replies: 123,
        isLiked: true,
    },
    {
        id: 2,
        user: { name: 'Sarah Chen', avatar: '' },
        comment: "Can you share more about the tech stack? I'm particularly interested in the real-time features for study sessions.",
        postedAgo: '1d ago',
        likes: 123,
        replies: 123,
        isLiked: false,
    },
    {
        id: 3,
        user: { name: 'Mike Johnson', avatar: '' },
        comment: 'The problem statement is spot on. I struggled with this exact issue during my university years.',
        postedAgo: '12h ago',
        likes: 123,
        replies: 123,
        isLiked: false,
    },
];

const ProjectDetails: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [comment, setComment] = useState('');
    const [discussion, setDiscussion] = useState(mockDiscussion);

    const handleLikeComment = (commentId: number) => {
        setDiscussion((prev) =>
            prev.map((d) => (d.id === commentId ? { ...d, isLiked: !d.isLiked, likes: d.isLiked ? d.likes - 1 : d.likes + 1 } : d)),
        );
    };

    const handlePostComment = () => {
        if (comment.trim()) {
            const newComment = {
                id: Date.now(),
                user: { name: 'You', avatar: '' },
                comment: comment.trim(),
                postedAgo: 'Just now',
                likes: 0,
                replies: 0,
                isLiked: false,
            };
            setDiscussion((prev) => [newComment, ...prev]);
            setComment('');
        }
    };

    const handleOpenThread = () => {
        navigate(`/projects/${id}/thread`);
    };

    return (
        <SinglePageLayout title={t('Project Details')} rightElement={<BookmarkIcon sx={{ color: '#ccc', fontSize: 20, cursor: 'pointer' }} />}>
            {/* Tags */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1, p: 2 }}>
                {mockProject.tags.map((tag) => (
                    <Chip key={tag} label={tag} sx={{ bgcolor: '#e8f5e9', color: '#1F8505', fontWeight: 600, fontSize: 13 }} />
                ))}
            </Box>

            {/* Title & Author */}
            <Box sx={{ p: 2, pb: 1 }}>
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
            </Box>

            {/* Thumbnail */}
            <CardMedia
                component="img"
                image={mockProject.thumbnail}
                alt={mockProject.title}
                sx={{ width: '100%', borderRadius: 0, mb: 2, maxHeight: 200, objectFit: 'cover' }}
            />

            {/* Description */}
            <Box sx={{ p: 2, pb: 1 }}>
                <Typography sx={{ color: '#222', fontSize: 15, mb: 2 }}>{mockProject.description}</Typography>
            </Box>

            {/* Project Details Sections */}
            <Box sx={{ p: 2, pt: 0 }}>
                {/* Problem & Solution */}
                <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Problem</Typography>
                    <Typography sx={{ color: '#444', fontSize: 14, mb: 2 }}>{mockProject.problem}</Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Solution</Typography>
                    <Typography sx={{ color: '#444', fontSize: 14, mb: 2 }}>{mockProject.solution}</Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Who Benefits</Typography>
                    <Typography sx={{ color: '#444', fontSize: 14 }}>{mockProject.whoBenefits}</Typography>
                </Paper>

                {/* Resources */}
                <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Resources</Typography>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {mockProject.resources.map((r, i) => (
                            <li key={i} style={{ color: '#444', fontSize: 14, marginBottom: 2 }}>
                                {r}
                            </li>
                        ))}
                    </ul>
                </Paper>

                {/* Attachments */}
                <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
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
                </Paper>

                {/* Next Steps */}
                <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Next Steps</Typography>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {mockProject.nextSteps.map((step, i) => (
                            <li key={i} style={{ color: '#444', fontSize: 14, marginBottom: 2 }}>
                                {step}
                            </li>
                        ))}
                    </ul>
                </Paper>
            </Box>

            {/* Team Members Section */}
            <Box sx={{ p: 2, pb: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 17, mb: 2, textAlign: 'center' }}>Team Members</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 2 }}>
                    {mockProject.teamMembers.map((member, index) => (
                        <Box key={index} sx={{ textAlign: 'center' }}>
                            <Avatar sx={{ width: 60, height: 60, bgcolor: '#e8f5e9', color: '#1F8505', mx: 'auto', mb: 1 }}>{member.name[0]}</Avatar>
                            <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{member.name}</Typography>
                        </Box>
                    ))}
                </Box>
                <Button
                    variant="contained"
                    sx={{
                        bgcolor: '#1F8505',
                        color: '#fff',
                        borderRadius: '25px',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: 16,
                        py: 1.5,
                        px: 4,
                        width: '100%',
                        position: 'relative',
                    }}
                >
                    Join this team
                    <Box
                        sx={{
                            position: 'absolute',
                            right: -8,
                            top: -8,
                            bgcolor: '#1F8505',
                            color: '#fff',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 600,
                            border: '2px solid #fff',
                        }}
                    >
                        <MailIcon sx={{ fontSize: 14 }} />
                    </Box>
                </Button>
            </Box>

            {/* Engagement Metrics */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, p: 2, pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FavoriteBorderIcon sx={{ color: '#666', fontSize: 20 }} />
                    <Typography sx={{ fontSize: 14, color: '#666' }}>{mockProject.likes}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VisibilityIcon sx={{ color: '#666', fontSize: 20 }} />
                    <Typography sx={{ fontSize: 14, color: '#666' }}>{mockProject.views}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ChatBubbleOutlineIcon sx={{ color: '#666', fontSize: 20 }} />
                    <Typography sx={{ fontSize: 14, color: '#666' }}>{mockProject.comments}</Typography>
                </Box>
            </Box>

            {/* Comment Input */}
            <Box sx={{ p: 2, pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: '#e8f5e9', color: '#1F8505' }}>U</Avatar>
                    <TextField
                        size="small"
                        placeholder="Discuss your opinion"
                        fullWidth
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        sx={{
                            bgcolor: '#f8f9fa',
                            borderRadius: '25px',
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '25px',
                                '& fieldset': {
                                    borderColor: '#e0e0e0',
                                },
                            },
                        }}
                    />
                    <IconButton
                        onClick={handlePostComment}
                        disabled={!comment.trim()}
                        sx={{
                            bgcolor: comment.trim() ? '#1F8505' : '#e0e0e0',
                            color: '#fff',
                            '&:hover': {
                                bgcolor: comment.trim() ? '#1a7a04' : '#e0e0e0',
                            },
                        }}
                    >
                        <SendIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Comments List */}
            <Box sx={{ p: 2, pt: 1 }}>
                {discussion.map((d, index) => (
                    <Box key={d.id} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Avatar sx={{ width: 40, height: 40, bgcolor: '#e8f5e9', color: '#1F8505', mt: 0.5 }}>{d.user.name[0]}</Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                    <Typography sx={{ fontWeight: 600, fontSize: 14, mr: 1 }}>{d.user.name}</Typography>
                                    <Typography sx={{ color: '#888', fontSize: 12 }}>Posted {d.postedAgo}</Typography>
                                </Box>
                                <Typography sx={{ color: '#444', fontSize: 14, mb: 1 }}>{d.comment}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <IconButton size="small" onClick={() => handleLikeComment(d.id)} sx={{ p: 0 }}>
                                            {d.isLiked ? (
                                                <FavoriteIcon sx={{ color: '#1F8505', fontSize: 16 }} />
                                            ) : (
                                                <FavoriteBorderIcon sx={{ color: '#666', fontSize: 16 }} />
                                            )}
                                        </IconButton>
                                        <Typography sx={{ fontSize: 12, color: '#666' }}>{d.likes}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <ChatBubbleOutlineIcon sx={{ color: '#666', fontSize: 16 }} />
                                        <Typography sx={{ fontSize: 12, color: '#666' }}>{d.replies} replies</Typography>
                                    </Box>
                                    <Typography
                                        sx={{ fontSize: 12, color: '#1F8505', fontWeight: 600, cursor: 'pointer' }}
                                        onClick={handleOpenThread}
                                    >
                                        Open Thread
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        {index < discussion.length - 1 && <Divider sx={{ mt: 2, opacity: 0.3 }} />}
                    </Box>
                ))}
            </Box>
        </SinglePageLayout>
    );
};

export default ProjectDetails;
