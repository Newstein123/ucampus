import React from 'react';
import { Box, Button, TextField, Typography, Paper, Link as MuiLink } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

const schema = z.object({
    email: z.string().email('Enter a valid email'),
});

type ForgotPasswordForm = z.infer<typeof schema>;

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
        resolver: zodResolver(schema),
        defaultValues: { email: '' },
    });

    const onSubmit = (data: ForgotPasswordForm) => {
        // TODO: Call API to send reset email
        // Show success message or handle error
    };

    return (
        <Box
            sx={{
                bgcolor: '#f7fafd',
                minHeight: '100vh',
                maxWidth: { xs: '100%', sm: 500 },
                mx: 'auto',
                display: 'flex',
                flexDirection: 'column',
                pt: 4,
                pb: 4,
                px: 2,
            }}>
            <Typography fontWeight={700} mb={1}>
                Forget Password
            </Typography>
            <Typography color="text.secondary" mb={3}>
                Enter your email account to reset password
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
                <Typography fontWeight={600} mb={0.5} sx={{ textAlign: 'start' }}>
                    Email
                </Typography>
                <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            placeholder="name@email.com"
                            fullWidth
                            margin="normal"
                            variant="outlined"
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            sx={{ mb: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #eee', '& .MuiInputBase-input': { padding: '10px 16px' } }}
                        />
                    )}
                />
                <Button
                    type="submit"
                    fullWidth
                    sx={{
                        bgcolor: '#188600',
                        color: '#fff',
                        fontWeight: 600,
                        borderRadius: 2,
                        width: '100%',
                        py: 1.2,
                        fontSize: 16,
                        mt: 1,
                        mb: 2,
                        '&:hover': { bgcolor: '#166c00' },
                    }}
                >
                    Continue
                </Button>
            </form>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Not a member?{' '}
                    <MuiLink component="button" onClick={() => navigate('/register')} sx={{ color: '#188600', fontWeight: 600, textDecoration: 'none' }}>
                        Register now
                    </MuiLink>
                </Typography>
            </Box>
        </Box >
    );
};

export default ForgotPassword; 