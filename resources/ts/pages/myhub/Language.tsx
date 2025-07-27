import React, { useState } from 'react';
import { Box, Typography, Paper, Radio, List, ListItem, ListItemText, ListItemIcon, ListItemButton } from '@mui/material';
import BackButton from '../../components/BackButton';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

const languages = [
    { label: 'English', value: 'en' },
    { label: 'Myanmar', value: 'my' },
    { label: 'Chinese', value: 'zh' },
];

const Language: React.FC = () => {
    const { t } = useTranslation();
    const [selected, setSelected] = useState(i18n.language || 'en');
    const handleSelect = (lang: string) => {
        setSelected(lang);
        i18n.changeLanguage(lang);
        localStorage.setItem('lang', lang);
    };
    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', minHeight: '100vh', bgcolor: '#f7fafd', p: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, pt: 2, pb: 1, position: 'sticky', top: 0, bgcolor: '#f7fafd', zIndex: 10 }}>
                <BackButton />
                <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#222', flex: 1, textAlign: 'center', mr: 4 }}>
                    {t('Language')}
                </Typography>
            </Box>
            <Paper elevation={0} sx={{ bgcolor: '#fff', borderRadius: 3, m: 2, p: 3 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 17, mb: 2 }}>{t('Select the app language')}</Typography>
                <List>
                    {languages.map((lang) => (
                        <ListItem key={lang.value} disablePadding sx={{ borderRadius: 2 }}>
                            <ListItemButton onClick={() => handleSelect(lang.value)} sx={{ borderRadius: 2 }}>
                                <ListItemText primary={lang.label} />
                                <ListItemIcon>
                                    <Radio checked={selected === lang.value} value={lang.value} color="success" />
                                </ListItemIcon>
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Box>
    );
};

export default Language; 