import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Link as MuiLink, TextField, Typography } from '@mui/material';
import { AxiosError } from 'axios';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { ErrorResponse } from '../hooks';
import useForgotPasswordMutation from '../hooks/auth/useForgotPasswordMutation';

const schema = z.object({
    email: z.string().email('Enter a valid email'),
});

type ForgotPasswordForm = z.infer<typeof schema>;

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordForm>({
        resolver: zodResolver(schema),
        defaultValues: { email: '' },
    });

    const forgotPasswordMutation = useForgotPasswordMutation();
    const [apiValidationErrors, setApiValidationErrors] = useState<ErrorResponse['errors']>({});
    const onSubmit = (data: ForgotPasswordForm) => {
        forgotPasswordMutation.mutate(data, {
            onSuccess: () => {
                navigate('/login');
            },
            onError: (error: AxiosError<ErrorResponse>) => {
                if (error.response?.data.errors) {
                    setApiValidationErrors(error.response.data.errors);
                }
            },
        });
    };

    return (
        <Box
            sx={{
                bgcolor: '#f7fafd',
                minHeight: '100vh',
                maxWidth: { xs: '100%', sm: 600 },
                mx: 'auto',
                display: 'flex',
                flexDirection: 'column',
                pt: 4,
                pb: 4,
                px: 2,
            }}
        >
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
                            sx={{ mb: 2, bgcolor: '#fff', borderRadius: 2 }}
                        />
                    )}
                />
                {apiValidationErrors.email && <Typography sx={{ color: 'red', fontSize: 12, mb: 1 }}>{apiValidationErrors.email}</Typography>}
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
                    <MuiLink
                        component="button"
                        onClick={() => navigate('/register')}
                        sx={{ color: '#188600', fontWeight: 600, textDecoration: 'none' }}
                    >
                        Register now
                    </MuiLink>
                </Typography>
            </Box>
        </Box>
    );
};

export default ForgotPassword;
