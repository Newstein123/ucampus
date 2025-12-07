import { Avatar, CircularProgress, List, ListItem, ListItemAvatar, ListItemText, Paper, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SinglePageLayout from '../../components/SinglePageLayout';
import useUserProfileQuery from '../../hooks/auth/useUserProfileQuery';
import useMyContributionsQuery from '../../hooks/contribution/useMyContributionsQuery';
import { Contribution } from '../../types/contribution';

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    // If the date is invalid, just return the original string (or a placeholder)
    if (isNaN(date.getTime())) {
        return dateString;
    }
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return '1 day ago';
    if (diff < 7) return `${diff} days ago`;
    return date.toLocaleDateString(undefined, { month: 'long', day: '2-digit', year: 'numeric' });
}

const MyIdeasAndQuestions: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data: userProfile } = useUserProfileQuery();
    const userId = userProfile?.data?.id;

    // Fetch user's ideas
    const {
        data: ideasData,
        isLoading: ideasLoading,
        error: ideasError,
    } = useMyContributionsQuery({
        type: 'idea',
        userId: userId || 0,
        perPage: 20,
        enabled: !!userId,
    });

    // Fetch user's questions
    const {
        data: questionsData,
        isLoading: questionsLoading,
        error: questionsError,
    } = useMyContributionsQuery({
        type: 'question',
        userId: userId || 0,
        perPage: 20,
        enabled: !!userId,
    });

    const ideas: Contribution[] = ideasData?.data || [];
    const questions: Contribution[] = questionsData?.data || [];

    const isLoading = ideasLoading || questionsLoading;

    return (
        <SinglePageLayout title={t('My ideas and questions')} bgColor="#fafdff">
            <Paper elevation={0} sx={{ bgcolor: '#fafdff', borderRadius: 3, p: 0, boxShadow: 'none', minHeight: '100vh' }}>
                {/* Section: Ideas */}
                <Typography sx={{ fontWeight: 700, fontSize: 16, px: 2, pt: 2, pb: 1 }}>{t('Ideas')}</Typography>
                {ideasLoading ? (
                    <Typography sx={{ textAlign: 'center', py: 2 }}>
                        <CircularProgress size={24} />
                    </Typography>
                ) : ideasError ? (
                    <Typography sx={{ color: 'error.main', px: 2, py: 1 }}>{t('Failed to load ideas')}</Typography>
                ) : ideas.length === 0 ? (
                    <Typography sx={{ color: '#888', px: 2, py: 2, textAlign: 'center' }}>{t('No ideas yet')}</Typography>
                ) : (
                    <List sx={{ px: 1 }}>
                        {ideas.map((idea) => (
                            <ListItem
                                key={idea.id}
                                sx={{
                                    bgcolor: '#fff',
                                    borderRadius: 3,
                                    mb: 2,
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                    p: 1.5,
                                    alignItems: 'flex-start',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        boxShadow: '0 4px 16px rgba(41, 67, 35, 0.08)',
                                        transform: 'translateY(-2px)',
                                    },
                                }}
                                onClick={() => navigate(`/ideas/${idea.id}`)}
                            >
                                <ListItemAvatar>
                                    <Avatar
                                        variant="rounded"
                                        src={idea.thumbnail_url || undefined}
                                        sx={{ width: 56, height: 56, mr: 2, bgcolor: '#e8f5e9' }}
                                    >
                                        {!idea.thumbnail_url && idea.title?.[0]?.toUpperCase()}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={<Typography sx={{ fontWeight: 700, fontSize: 15, color: '#222' }}>{idea.title}</Typography>}
                                    secondary={
                                        <Typography sx={{ color: '#aaa', fontSize: 13, mt: 0.5 }}>{formatDate(idea.created_at)}</Typography>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                )}

                {/* Section: Questions */}
                <Typography sx={{ fontWeight: 700, fontSize: 16, px: 2, pt: 1, pb: 1 }}>{t('Questions')}</Typography>
                {questionsLoading ? (
                    <Typography sx={{ textAlign: 'center', py: 2 }}>
                        <CircularProgress size={24} />
                    </Typography>
                ) : questionsError ? (
                    <Typography sx={{ color: 'error.main', px: 2, py: 1 }}>{t('Failed to load questions')}</Typography>
                ) : questions.length === 0 ? (
                    <Typography sx={{ color: '#888', px: 2, py: 2, textAlign: 'center' }}>{t('No questions yet')}</Typography>
                ) : (
                    <List sx={{ px: 1 }}>
                        {questions.map((q) => (
                            <ListItem
                                key={q.id}
                                sx={{
                                    bgcolor: '#fff',
                                    borderRadius: 3,
                                    mb: 2,
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                    p: 1.5,
                                    alignItems: 'flex-start',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        boxShadow: '0 4px 16px rgba(41, 67, 35, 0.08)',
                                        transform: 'translateY(-2px)',
                                    },
                                }}
                                onClick={() => navigate(`/questions/${q.id}`)}
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
                                    secondary={
                                        <Typography sx={{ color: '#aaa', fontSize: 13, mt: 0.5 }}>{formatDate(q.created_at)}</Typography>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Paper>
        </SinglePageLayout>
    );
};

export default MyIdeasAndQuestions;
