import React from 'react';
import { Box, Typography, Button, ListItem, ListItemText, List, ListItemIcon } from '@mui/material';
import Layout from '../../components/Layout';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import FolderIcon from '@mui/icons-material/Folder';
import { ArrowForwardIos } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const contributionItems: { title: string, description: string, icon: React.ReactNode, path: string }[] = [
    {
        title: 'Idea Contribution',
        description: 'Share your idea with the community',
        icon: <LightbulbIcon />,
        path: '/contribution/create-idea'
    },
    {
        title: 'Question Contribution',
        description: 'Ask a question to the community',
        icon: <QuestionAnswerIcon />,
        path: '/contribution/create-question'
    },
    {
        title: 'Project Contribution',
        description: 'Share your project with the community',
        icon: <FolderIcon />,
        path: '/contribution/create-project'
    }
];

const Create: React.FC = () => {
    const navigate = useNavigate();
    return (
        <Layout>
            <Box
                sx={{
                    maxWidth: 600,
                    width: '100%',
                    mx: 'auto',
                    bgcolor: '#f7fafd',
                    borderRadius: 2,
                    p: 2,
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 700, my: 2, textAlign: 'center', fontSize: '14px' }}>
                    Create new contribution
                </Typography>
                <Typography sx={{ mb: 3, textAlign: 'start', fontSize: '14px', fontWeight: 700 }}>
                    What do you want to contribute?
                </Typography>

                <List>
                    {contributionItems.map((item, index) => (
                        <ListItem key={index} sx={{
                            bgcolor: '#fff',
                            borderRadius: 2,
                            p: 2,
                            mb: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            '&:hover': {
                                bgcolor: '#f0f0f0'
                            }
                        }} onClick={() => navigate(item.path)}>
                            <ListItemIcon>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText sx={{ fontSize: '14px' }} primary={item.title} secondary={item.description} />
                            <ArrowForwardIos sx={{ color: '#1F8505' }} />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Layout>
    );
};

export default Create;