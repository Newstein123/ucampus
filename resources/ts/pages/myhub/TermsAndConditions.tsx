import { Paper, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import SinglePageLayout from '../../components/SinglePageLayout';

const TermsAndConditions: React.FC = () => {
    const { t } = useTranslation();
    return (
        <SinglePageLayout title={t('Terms & Conditions')}>
            <Paper elevation={0} sx={{ bgcolor: '#fff', borderRadius: 3, m: 2, p: 3, fontSize: 15 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 1 }}>{t('U Campus – Terms and Conditions')}</Typography>
                <Typography sx={{ color: '#888', fontSize: 13, mb: 2 }}>{t('Last updated: June 25, 2025')}</Typography>
                <Typography sx={{ mb: 2 }}>
                    {t(
                        'Welcome to U Campus – a platform built for students and young creatives to share IT ideas, ask questions, exchange opinions, and learn together. Please read these Terms and Conditions ("Terms") carefully before using the U Campus app or website.',
                    )}
                </Typography>
                <Typography sx={{ mb: 1, fontWeight: 600 }}>{t('By using U Campus, you agree to follow these Terms, including:')}</Typography>
                <Typography sx={{ mb: 1, fontWeight: 600 }}>{t('Who Can Use U Campus')}</Typography>
                <ul style={{ marginTop: 0, marginBottom: 8, paddingLeft: 20 }}>
                    <li>
                        {t('You must be 13 years or older to use U Campus. If you are under 18, please get permission from a parent or guardian.')}
                    </li>
                    <li>{t('You must create an account with accurate information and keep your login details private.')}</li>
                </ul>
                <Typography sx={{ mb: 1, fontWeight: 600 }}>{t('What You Can Post')}</Typography>
                <ul style={{ marginTop: 0, marginBottom: 8, paddingLeft: 20 }}>
                    <li>{t('Your welcome post')}</li>
                    <li>{t('Ideas, questions, and projects related to technology, design, and innovation')}</li>
                    <li>{t('Resources (tools, links, templates) that help others')}</li>
                    <li>{t('Kind feedback, likes, respectful comments, and collaborative requests')}</li>
                </ul>
                <Typography sx={{ mb: 1, fontWeight: 600 }}>{t('What You Cannot Post')}</Typography>
                <ul style={{ marginTop: 0, marginBottom: 8, paddingLeft: 20 }}>
                    <li>{t('Hate speech, abuse, or hateful content')}</li>
                    <li>{t('Spam, advertising, or misleading information')}</li>
                    <li>{t("Material you don't own or lack rights")}</li>
                    <li>{t('Content that violates our values or users who break these rules')}</li>
                </ul>
                <Typography sx={{ mb: 1, fontWeight: 600 }}>{t('Uploads and Attachments')}</Typography>
                <Typography sx={{ mb: 2 }}>
                    {t(
                        "You're responsible for what you upload. Only share files you own or control. You must have permission to use any content you upload. We may remove content that violates these Terms.",
                    )}
                </Typography>
                <Typography sx={{ color: '#aaa', fontSize: 12, mt: 2 }}>{t('Last updated: June 25, 2025')}</Typography>
            </Paper>
        </SinglePageLayout>
    );
};

export default TermsAndConditions;
