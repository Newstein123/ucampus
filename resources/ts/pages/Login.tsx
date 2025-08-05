import { zodResolver } from '@hookform/resolvers/zod';
import GoogleIcon from '@mui/icons-material/Google';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Box, Button, Divider, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ErrorResponse } from '../hooks';
import useUserLoginMutation from '../hooks/auth/useUserLoginMuatation';
import { usePWANavigation } from '../hooks/usePWANavigation';
import { loginSchema, type LoginFormData } from '../schemas/auth';
import { setUser } from '../store/slices/authSlice';
import { LoginUser } from '../types/auth';
import { addPWAMetaTags } from '../utils/pwa';

const Login: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const pwaNavigate = usePWANavigation();
    const dispatch = useDispatch();
    const userLoginMutation = useUserLoginMutation();
    const [apiValidationErrors, setApiValidationErrors] = useState<ErrorResponse['errors']>({});

    // Add PWA meta tags on component mount
    useEffect(() => {
        addPWAMetaTags();
    }, []);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            login: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        console.log('Login Called');
        userLoginMutation.mutate(
            {
                login: data.login,
                password: data.password,
            },
            {
                onSuccess: (response) => {
                    console.log('Login Success');
                    console.log(response.data.first_login);
                    dispatch(setUser({ user: response.data.user as unknown as LoginUser }));

                    // Use PWA-aware navigation with fallback
                    const targetPath = response.data.first_login ? '/onboarding' : '/';
                    console.log(`Navigating to: ${targetPath}`);
                    
                    // Small delay to ensure Redux state is updated
                    setTimeout(() => {
                        // Try PWA navigation first, fallback to regular navigation
                        try {
                            pwaNavigate(targetPath, { replace: true });
                            
                            // Add a timeout fallback in case PWA navigation fails
                            setTimeout(() => {
                                // Check if we're still on the login page
                                if (window.location.pathname === '/login') {
                                    console.log('PWA navigation failed, using fallback');
                                    navigate(targetPath, { replace: true });
                                }
                            }, 1000);
                            
                            // Additional immediate fallback
                            setTimeout(() => {
                                if (window.location.pathname === '/login') {
                                    console.log('Force navigation using window.location');
                                    window.location.replace(targetPath);
                                }
                            }, 2000);
                        } catch (error) {
                            console.error('PWA navigation error:', error);
                            navigate(targetPath, { replace: true });
                        }
                    }, 100);
                },
                onError: (error: AxiosError<ErrorResponse>) => {
                    if (error.response?.data.errors) {
                        setApiValidationErrors(error.response.data.errors);
                    }
                },
            },
        );
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
                alignItems: 'center',
                pb: 2,
            }}
        >
            {/* Top image section */}
            <Box
                sx={{
                    bgcolor: '#d9f5d6',
                    width: '100%',
                    height: 240,
                    borderRadius: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    mb: 3,
                }}
            >
                {/* Placeholder image */}
                <img
                    src="/assets/images/login_cover.png"
                    alt="login"
                    style={{
                        opacity: 1,
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '100%',
                        height: '100%',
                        transform: 'translate(-50%, -50%)',
                    }}
                />
            </Box>

            {/* Login form */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%', px: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                    Welcome!
                </Typography>

                {/* Global error message */}
                {Object.keys(apiValidationErrors).length > 0 && (
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#d32f2f',
                            mb: 2,
                            textAlign: 'center',
                            bgcolor: '#ffebee',
                            p: 1,
                            borderRadius: 1,
                        }}
                    >
                        {Object.values(apiValidationErrors).flat().join(', ')}
                    </Typography>
                )}

                <TextField
                    {...register('login')}
                    fullWidth
                    label="Login"
                    variant="outlined"
                    margin="normal"
                    type="text"
                    InputLabelProps={{ shrink: true }}
                    sx={{ bgcolor: '#fff', borderRadius: 2 }}
                    error={!!errors.login}
                    helperText={errors.login?.message}
                />

                <TextField
                    {...register('password')}
                    fullWidth
                    label="Password"
                    variant="outlined"
                    margin="normal"
                    type={showPassword ? 'text' : 'password'}
                    InputLabelProps={{ shrink: true }}
                    sx={{ bgcolor: '#fff', borderRadius: 2 }}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword((show) => !show)} edge="end">
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                {/* Forgot password link */}
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', mt: -1, mb: 2 }}>
                    <Typography
                        variant="body2"
                        color="primary"
                        sx={{ cursor: 'pointer', textDecoration: 'underline', fontSize: 14 }}
                        onClick={() => navigate('/forgot-password')}
                    >
                        Forgot password?
                    </Typography>
                </Box>

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={userLoginMutation.isPending}
                    sx={{
                        bgcolor: '#1abc60',
                        color: '#fff',
                        fontWeight: 600,
                        borderRadius: 2,
                        py: 1.2,
                        mb: 2,
                        textTransform: 'none',
                        fontSize: 16,
                        '&:hover': { bgcolor: '#168f48' },
                        '&:disabled': { bgcolor: '#ccc' },
                    }}
                >
                    {userLoginMutation.isPending ? 'Logging in...' : 'Login'}
                </Button>

                <Typography align="center" sx={{ fontSize: 15, mb: 2 }}>
                    Not a member? <span onClick={() => navigate('/register')}>Register now</span>
                </Typography>

                <Divider sx={{ my: 2 }}>Or continue with</Divider>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button
                        sx={{
                            bgcolor: '#fff',
                            color: '#000',
                            '&:hover': { bgcolor: '#f0f0f0' },
                            borderRadius: 10,
                            py: 1.2,
                            mb: 2,
                            textTransform: 'none',
                            fontSize: 16,
                            width: '100%',
                            border: '1px solid #000',
                        }}
                    >
                        <GoogleIcon />
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default Login;
