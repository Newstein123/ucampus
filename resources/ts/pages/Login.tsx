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
import { apiClient } from '../api/client';
import AppButton from '../components/AppButton';
import { ErrorResponse } from '../hooks';
import useSocialAuthQuery from '../hooks/auth/useSocialAuthQuery';
import useUserLoginMutation from '../hooks/auth/useUserLoginMuatation';
import { usePWANavigation } from '../hooks/usePWANavigation';
import { loginSchema, type LoginFormData } from '../schemas/auth';
import { setUser } from '../store/slices/authSlice';
import { LoginUser } from '../types/auth';
import { addPWAMetaTags } from '../utils/pwa';

const Login: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { navigate: pwaNavigate } = usePWANavigation();
    const dispatch = useDispatch();
    const userLoginMutation = useUserLoginMutation();
    const [apiValidationErrors, setApiValidationErrors] = useState<ErrorResponse['errors']>({});
    const [socialAuthEnabled, setSocialAuthEnabled] = useState(false);
    const { data: socialAuthQuery, isSuccess, isLoading } = useSocialAuthQuery('google', socialAuthEnabled);
    // Add PWA meta tags on component mount
    useEffect(() => {
        addPWAMetaTags();
    }, []);

    // Listen for postMessage from popup
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            console.log('Received postMessage:', event.data);
            if (event.data.type === 'SOCIAL_AUTH_SUCCESS') {
                console.log('Processing SOCIAL_AUTH_SUCCESS message');
                const { token, user } = event.data;

                // Set the token in the API client
                apiClient.setAuthToken(token);

                // Dispatch user to Redux
                dispatch(setUser({ user }));

                // Navigate based on first login status
                const targetPath = user.first_login ? '/onboarding' : '/';

                // Use PWA-aware navigation
                setTimeout(() => {
                    try {
                        pwaNavigate(targetPath, { replace: true });

                        // Fallback navigation
                        setTimeout(() => {
                            if (window.location.pathname === '/login') {
                                navigate(targetPath, { replace: true });
                            }
                        }, 1000);
                    } catch (error) {
                        console.error('PWA navigation error:', error);
                        navigate(targetPath, { replace: true });
                    }
                }, 100);
            } else if (event.data.type === 'SOCIAL_AUTH_ERROR') {
                console.error('Social auth error:', event.data.message);
                // Handle error - could show a toast notification
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [dispatch, pwaNavigate, navigate]);

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

    const handleSocialAuth = () => {
        // Get the auth URL first
        setSocialAuthEnabled(true);
    };

    // Handle social auth popup when query is successful
    useEffect(() => {
        if (isSuccess && socialAuthQuery?.data?.url) {
            let authUrl = socialAuthQuery.data.url;

            // Add popup parameter to the callback URL
            const separator = authUrl.includes('?') ? '&' : '?';
            authUrl += `${separator}popup=true`;

            // Calculate popup dimensions
            const width = 500;
            const height = 600;
            const left = window.screenX + (window.outerWidth - width) / 2;
            const top = window.screenY + (window.outerHeight - height) / 2;

            // Open popup window
            const popup = window.open(authUrl, 'socialAuth', `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`);

            if (popup) {
                // Use a more reliable approach that doesn't rely on window.closed
                // Instead, we'll rely on the postMessage communication and localStorage

                // Set a flag to indicate we're in popup mode
                localStorage.setItem('social_auth_popup_active', 'true');

                // Cleanup function to remove the flag
                const cleanup = () => {
                    localStorage.removeItem('social_auth_popup_active');
                };

                // Listen for storage events (when popup sets localStorage)
                const handleStorageChange = (e: StorageEvent) => {
                    console.log('Storage event received:', e.key, e.newValue);
                    if (e.key === 'social_auth_token' && e.newValue) {
                        console.log('Processing social_auth_token from storage event');
                        const token = e.newValue;
                        const userData = localStorage.getItem('social_auth_user');

                        if (userData) {
                            // Clear the temporary storage
                            localStorage.removeItem('social_auth_token');
                            localStorage.removeItem('social_auth_user');
                            localStorage.removeItem('social_auth_popup_active');

                            // Remove the storage event listener
                            window.removeEventListener('storage', handleStorageChange);

                            // Set the token in the API client
                            apiClient.setAuthToken(token);

                            // Parse user data and dispatch to Redux
                            try {
                                const user = JSON.parse(userData);
                                dispatch(setUser({ user }));

                                // Navigate based on first login status
                                const targetPath = user.first_login ? '/onboarding' : '/';

                                // Use PWA-aware navigation
                                setTimeout(() => {
                                    try {
                                        pwaNavigate(targetPath, { replace: true });

                                        // Fallback navigation
                                        setTimeout(() => {
                                            if (window.location.pathname === '/login') {
                                                navigate(targetPath, { replace: true });
                                            }
                                        }, 1000);
                                    } catch (error) {
                                        console.error('PWA navigation error:', error);
                                        navigate(targetPath, { replace: true });
                                    }
                                }, 100);
                            } catch (error) {
                                console.error('Error parsing user data:', error);
                            }
                        }
                    }
                };

                // Add storage event listener
                window.addEventListener('storage', handleStorageChange);

                // Fallback: Check for auth data every 2 seconds for up to 5 minutes
                const checkAuthData = setInterval(() => {
                    const token = localStorage.getItem('social_auth_token');
                    const userData = localStorage.getItem('social_auth_user');

                    if (token && userData) {
                        clearInterval(checkAuthData);
                        window.removeEventListener('storage', handleStorageChange);
                        cleanup();

                        // Process the auth data (same logic as above)
                        localStorage.removeItem('social_auth_token');
                        localStorage.removeItem('social_auth_user');

                        apiClient.setAuthToken(token);

                        try {
                            const user = JSON.parse(userData);
                            dispatch(setUser({ user }));

                            const targetPath = user.first_login ? '/onboarding' : '/';

                            setTimeout(() => {
                                try {
                                    pwaNavigate(targetPath, { replace: true });

                                    setTimeout(() => {
                                        if (window.location.pathname === '/login') {
                                            navigate(targetPath, { replace: true });
                                        }
                                    }, 1000);
                                } catch (error) {
                                    console.error('PWA navigation error:', error);
                                    navigate(targetPath, { replace: true });
                                }
                            }, 100);
                        } catch (error) {
                            console.error('Error parsing user data:', error);
                        }
                    }
                }, 2000);

                // Additional fallback: Check if popup is still active after 30 seconds
                // If not, we might need to handle the case where popup was closed manually
                setTimeout(() => {
                    const popupActive = localStorage.getItem('social_auth_popup_active');
                    if (popupActive) {
                        console.log('Popup still active after 30 seconds, continuing to monitor...');
                    }
                }, 30000);

                // Cleanup after 5 minutes
                setTimeout(() => {
                    clearInterval(checkAuthData);
                    window.removeEventListener('storage', handleStorageChange);
                    cleanup();
                }, 300000);
            } else {
                // Popup blocked, fallback to redirect
                console.log('Popup blocked, using redirect fallback');
                window.location.href = authUrl;
            }

            // Reset the query state
            setSocialAuthEnabled(false);
        }
    }, [isSuccess, socialAuthQuery?.data, dispatch, pwaNavigate, navigate]);

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
                    src="/assets/images/login-cover.png"
                    alt="login"
                    style={{
                        opacity: 1,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
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

                <AppButton
                    type="submit"
                    fullWidth
                    disabled={userLoginMutation.isPending}
                    sx={{
                        bgcolor: '#1abc60', // Keeping the specific green for login if intended, or remove to use default
                        '&:hover': { bgcolor: '#168f48' },
                        mb: 2,
                        py: 1.2,
                        fontSize: 16,
                    }}
                >
                    {userLoginMutation.isPending ? 'Logging in...' : 'Login'}
                </AppButton>

                <Typography align="center" sx={{ fontSize: 15, mb: 2 }}>
                    Not a member?{' '}
                    <span
                        onClick={() => navigate('/register')}
                        style={{ color: '#188600', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }}
                    >
                        Register now
                    </span>
                </Typography>

                <Divider sx={{ my: 2 }}>Or continue with</Divider>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button
                        onClick={handleSocialAuth}
                        disabled={isLoading}
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
                        {isLoading ? 'Loading...' : <GoogleIcon />}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default Login;
