import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Grid, Paper, TextField, Typography } from '@mui/material';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import BackButton from '../../components/BackButton';

const contactSchema = z.object({
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().email('Enter a valid email'),
    message: z.string().min(1, 'Message is required'),
});
type ContactForm = z.infer<typeof contactSchema>;

const ContactUs: React.FC = () => {
    const { t } = useTranslation();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ContactForm>({
        resolver: zodResolver(contactSchema),
        mode: 'onTouched',
    });

    const onSubmit = (data: ContactForm) => {
        // TODO: send to API
        console.log('Contact form data:', data);
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', minHeight: '100vh', bgcolor: '#f7fafd', p: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, pt: 2, pb: 1, position: 'sticky', top: 0, bgcolor: '#f7fafd', zIndex: 10 }}>
                <BackButton />
                <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#222', flex: 1, textAlign: 'center', mr: 4 }}>{t('Contact us')}</Typography>
            </Box>
            <Paper elevation={0} sx={{ bgcolor: '#fff', borderRadius: 3, m: 2, p: 3 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 17, mb: 2 }}>{t('Sent us a message')}</Typography>
                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Controller
                        name="fullName"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label={t('Full name')}
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                error={!!errors.fullName}
                                helperText={errors.fullName?.message || ' '}
                                sx={{ mb: 0, bgcolor: '#fff', borderRadius: 2 }}
                            />
                        )}
                    />
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label={t('Email Address')}
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                error={!!errors.email}
                                helperText={errors.email?.message || ' '}
                                sx={{ mb: 0, bgcolor: '#fff', borderRadius: 2 }}
                            />
                        )}
                    />
                    <Controller
                        name="message"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label={t('Your message')}
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                multiline
                                minRows={3}
                                error={!!errors.message}
                                helperText={errors.message?.message || ' '}
                                sx={{ mb: 0, bgcolor: '#fff', borderRadius: 2 }}
                            />
                        )}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{ bgcolor: '#1F8505', borderRadius: 2, fontWeight: 600, fontSize: 16, mt: 1, mb: 2, '&:hover': { bgcolor: '#176b03' } }}
                        fullWidth
                    >
                        {t('Submit')}
                    </Button>
                </Box>
                <Typography sx={{ color: '#888', fontSize: 14, mb: 1, mt: 2 }}>{t('Alternatively, reach us at')}</Typography>
                <Grid container spacing={1}>
                    <Grid item xs={6} sm={3}>
                        <Box
                            component="button"
                            onClick={() => window.open('tel:+959123456789', '_blank')}
                            sx={{
                                bgcolor: '#e8f5e9',
                                borderRadius: 2,
                                p: 1,
                                textAlign: 'center',
                                fontSize: 13,
                                mb: 1,
                                width: '100%',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{t('Phone number')}</Typography>
                            <Typography sx={{ color: '#1F8505', fontSize: 13 }}>+959123456789</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Box
                            component="button"
                            onClick={() => window.open('mailto:support@ucampus.app', '_blank')}
                            sx={{
                                bgcolor: '#e8f5e9',
                                borderRadius: 2,
                                p: 1,
                                textAlign: 'center',
                                fontSize: 13,
                                mb: 1,
                                width: '100%',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{t('Email')}</Typography>
                            <Typography sx={{ color: '#1F8505', fontSize: 13 }}>support@ucampus.app</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Box
                            component="button"
                            onClick={() => window.open('https://t.me/ucampus', '_blank')}
                            sx={{
                                bgcolor: '#e8f5e9',
                                borderRadius: 2,
                                p: 1,
                                textAlign: 'center',
                                fontSize: 13,
                                mb: 1,
                                width: '100%',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{t('Telegram')}</Typography>
                            <Typography sx={{ color: '#1F8505', fontSize: 13 }}>@ucampus</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Box
                            component="button"
                            onClick={() => window.open('https://www.instagram.com/ucampus', '_blank')}
                            sx={{
                                bgcolor: '#e8f5e9',
                                borderRadius: 2,
                                p: 1,
                                textAlign: 'center',
                                fontSize: 13,
                                mb: 1,
                                width: '100%',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{t('Instagram')}</Typography>
                            <Typography sx={{ color: '#1F8505', fontSize: 13 }}>@ucampus</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default ContactUs;
