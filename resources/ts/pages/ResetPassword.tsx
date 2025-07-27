import React, { useState } from 'react';
import { Box, Button, TextField, Typography, IconButton, InputAdornment, Link as MuiLink } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import useResetPasswordMutation from '../hooks/auth/useResetPasswordMutation';
import { useSearchParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import { ErrorResponse } from '../hooks';

const schema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

type ResetPasswordForm = z.infer<typeof schema>;

const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const { control, handleSubmit, formState: { errors } } = useForm<ResetPasswordForm>({
        resolver: zodResolver(schema),
        defaultValues: { password: '', confirmPassword: '' },
    });
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirm, setShowConfirm] = React.useState(false);
    const resetPasswordMutation = useResetPasswordMutation();
    const [apiValidationErrors, setApiValidationErrors] = useState<ErrorResponse['errors']>({});
    const onSubmit = (data: ResetPasswordForm) => {
        resetPasswordMutation.mutate({
            email: email as string,
            token: token as string,
            password: data.password,
            password_confirmation: data.confirmPassword,
        }, {
            onSuccess: () => {
                navigate('/login');
            },
            onError: (error: AxiosError<ErrorResponse>) => {
                if (error.response?.data.errors) {
                    setApiValidationErrors(error.response.data.errors);
                }
            }
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
            }}>
            <Typography fontWeight={700} mb={1}>
                Create New Password
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
                <Typography fontWeight={600} mb={0.5} sx={{ textAlign: 'start' }}>
                    Enter New Password
                </Typography>
                <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter password"
                            fullWidth
                            margin="normal"
                            variant="outlined"
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            sx={{ mb: 2, bgcolor: '#fff', borderRadius: 2 }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword((v) => !v)} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    )}
                />
                {apiValidationErrors.password && (
                    <Typography sx={{ color: 'red', fontSize: 12, mb: 1 }}>{apiValidationErrors.password}</Typography>
                )}
                <Typography fontWeight={600} mb={0.5} sx={{ textAlign: 'start' }}>
                    Confirm Password
                </Typography>
                <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            type={showConfirm ? 'text' : 'password'}
                            placeholder="Retype your password"
                            fullWidth
                            margin="normal"
                            variant="outlined"
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword?.message}
                            sx={{ mb: 2, bgcolor: '#fff', borderRadius: 2 }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowConfirm((v) => !v)} edge="end">
                                            {showConfirm ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    )}
                />
                {apiValidationErrors.password && (
                    <Typography sx={{ color: 'red', fontSize: 12, mb: 1 }}>{apiValidationErrors.confirmPassword}</Typography>
                )}
                <Button
                    type="submit"
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
        </Box>
    );
};

export default ResetPassword; 