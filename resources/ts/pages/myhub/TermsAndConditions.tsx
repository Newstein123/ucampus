import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import BackButton from '../../components/BackButton';

const TermsAndConditions: React.FC = () => (
    <Box sx={{ maxWidth: 600, mx: 'auto', minHeight: '100vh', bgcolor: '#f7fafd', p: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, pt: 2, pb: 1, position: 'sticky', top: 0, bgcolor: '#f7fafd', zIndex: 10 }}>
            <BackButton />
            <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#222', flex: 1, textAlign: 'center', mr: 4 }}>
                Terms & Conditions
            </Typography>
        </Box>
        <Paper elevation={0} sx={{ bgcolor: '#fff', borderRadius: 3, m: 2, p: 3, fontSize: 15 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 1 }}>
                U Campus – Terms and Conditions
            </Typography>
            <Typography sx={{ color: '#888', fontSize: 13, mb: 2 }}>
                Last updated: June 25, 2025
            </Typography>
            <Typography sx={{ mb: 2 }}>
                Welcome to U Campus – a platform built for students and young creatives to share IT ideas, ask questions, exchange opinions, and learn together. Please read these Terms and Conditions ("Terms") carefully before using the U Campus app or website.
            </Typography>
            <Typography sx={{ mb: 1, fontWeight: 600 }}>By using U Campus, you agree to follow these Terms, including:</Typography>
            <Typography sx={{ mb: 1, fontWeight: 600 }}>Who Can Use U Campus</Typography>
            <ul style={{ marginTop: 0, marginBottom: 8, paddingLeft: 20 }}>
                <li>You must be 13 years or older to use U Campus. If you are under 18, please get permission from a parent or guardian.</li>
                <li>You must create an account with accurate information and keep your login details private.</li>
            </ul>
            <Typography sx={{ mb: 1, fontWeight: 600 }}>What You Can Post</Typography>
            <ul style={{ marginTop: 0, marginBottom: 8, paddingLeft: 20 }}>
                <li>Your welcome post</li>
                <li>Ideas, questions, and projects related to technology, design, and innovation</li>
                <li>Resources (tools, links, templates) that help others</li>
                <li>Kind feedback, likes, respectful comments, and collaborative requests</li>
            </ul>
            <Typography sx={{ mb: 1, fontWeight: 600 }}>What You Cannot Post</Typography>
            <ul style={{ marginTop: 0, marginBottom: 8, paddingLeft: 20 }}>
                <li>Hate speech, abuse, or hateful content</li>
                <li>Spam, advertising, or misleading information</li>
                <li>Material you don’t own or lack rights</li>
                <li>Content that violates our values or users who break these rules</li>
            </ul>
            <Typography sx={{ mb: 1, fontWeight: 600 }}>Uploads and Attachments</Typography>
            <Typography sx={{ mb: 2 }}>
                You’re responsible for what you upload. Only share files you own or control. You must have permission to use any content you upload. We may remove content that violates these Terms.
            </Typography>
            <Typography sx={{ color: '#aaa', fontSize: 12, mt: 2 }}>
                Last updated: June 25, 2025
            </Typography>
        </Paper>
    </Box>
);

export default TermsAndConditions; 