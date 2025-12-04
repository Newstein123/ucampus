import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Radio, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SinglePageLayout from '../../components/SinglePageLayout';
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
        <SinglePageLayout title={t('Language')}>
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
        </SinglePageLayout>
    );
};

export default Language;
