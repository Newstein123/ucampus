import { zodResolver } from '@hookform/resolvers/zod';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Box, Checkbox, FormControlLabel, IconButton, InputAdornment, MenuItem, Link as MuiLink, TextField, Typography } from '@mui/material';
import { AxiosError } from 'axios';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { apiClient } from '../api/client';
import AppButton from '../components/AppButton';
import BackButton from '../components/BackButton';
import { ErrorResponse } from '../hooks';
import useUserRegisterMutation from '../hooks/auth/useUserRegisterMutation';
import { step1Schema, step2Schema } from '../schemas/register';

type Step1Form = z.infer<typeof step1Schema>;
type Step2Form = z.infer<typeof step2Schema>;

const locations = [
    'Ayeyarwady',
    'Bago',
    'Chin',
    'Kachin',
    'Kayah',
    'Kayin',
    'Magway',
    'Mandalay',
    'Mon',
    'Naypyidaw',
    'Rakhine',
    'Sagaing',
    'Shan',
    'Tanintharyi',
    'Yangon',
    'Other',
];

const Register: React.FC = () => {
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [apiError, setApiError] = useState<{ [key: string]: string | string[] } | null>(null);
    const navigate = useNavigate();
    const userRegisterMutation = useUserRegisterMutation();
    const step1Form = useForm<Step1Form>({
        resolver: zodResolver(step1Schema),
        mode: 'onTouched',
    });

    const step2Form = useForm<Step2Form>({
        resolver: zodResolver(step2Schema),
        mode: 'onTouched',
    });

    const checkUsernameAvailability = async (username: string) => {
        try {
            await apiClient.getClient().post('/auth/check-username', { username });
            return true;
        } catch (err: unknown) {
            const error = err as AxiosError;
            if (error.response && error.response.status === 422) {
                step1Form.setError('username', {
                    type: 'manual',
                    message: 'The username has already been taken.',
                });
                return false;
            }
            return true; // If other error, let backend validation handle it later or ignore
        }
    };

    const checkEmailAvailability = async (email: string) => {
        try {
            await apiClient.getClient().post('/auth/check-email', { email });
            return true;
        } catch (err: unknown) {
            const error = err as AxiosError;
            if (error.response && error.response.status === 422) {
                step1Form.setError('email', {
                    type: 'manual',
                    message: 'The email has already been taken.',
                });
                return false;
            }
            return true;
        }
    };

    const handleStep1 = async (data: Step1Form) => {
        const isUsernameAvailable = await checkUsernameAvailability(data.username);
        const isEmailAvailable = await checkEmailAvailability(data.email);

        if (isUsernameAvailable && isEmailAvailable) {
            setStep(2);
        }
    };

    const handleRegister = (data: Step2Form) => {
        const request = {
            ...step1Form.getValues(),
            ...data,
        };
        console.log(request);
        userRegisterMutation.mutate(request, {
            onSuccess: () => {
                navigate('/login');
            },
            onError: (error: AxiosError<ErrorResponse>) => {
                const errors = error.response?.data.errors || null;
                setApiError(errors);

                if (errors) {
                    if (errors.username) {
                        alert(Array.isArray(errors.username) ? errors.username[0] : errors.username);
                        setStep(1);
                    }
                    if (errors.email) {
                        alert(Array.isArray(errors.email) ? errors.email[0] : errors.email);
                        setStep(1);
                    }
                }
            },
        });
    };

    return (
        <Box
            sx={{
                maxWidth: 600,
                width: '100%',
                mx: 'auto',
                px: 2,
                minHeight: '100vh',
                bgcolor: '#f5f6f7',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                py: 4,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, ml: 1 }}>
                {step === 2 && <BackButton onClick={() => setStep(1)} sx={{ ml: -2 }} />}
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Sign up
                </Typography>
            </Box>
            <Typography sx={{ color: '#888', mb: 3, ml: 1 }}>{step === 1 ? 'Create an account to get started' : 'Finish your profile'}</Typography>

            {step === 1 && (
                <>
                    <form onSubmit={step1Form.handleSubmit(handleStep1)} style={{ width: '100%' }}>
                        {apiError && (
                            <Typography color="error" variant="caption">
                                {apiError.email}
                            </Typography>
                        )}
                        <TextField
                            label="Email Address"
                            fullWidth
                            margin="normal"
                            {...step1Form.register('email')}
                            error={!!step1Form.formState.errors.email}
                            helperText={step1Form.formState.errors.email?.message}
                            InputProps={{
                                placeholder: 'name@email.com',
                            }}
                        />
                        {apiError && (
                            <Typography color="error" variant="caption">
                                {apiError.email}
                            </Typography>
                        )}
                        <TextField
                            label="Username"
                            fullWidth
                            margin="normal"
                            {...step1Form.register('username')}
                            error={!!step1Form.formState.errors.username}
                            helperText={step1Form.formState.errors.username?.message}
                            InputProps={{
                                placeholder: 'username',
                            }}
                        />
                        {apiError && (
                            <Typography color="error" variant="caption">
                                {apiError.username}
                            </Typography>
                        )}
                        <TextField
                            label="Password"
                            fullWidth
                            margin="normal"
                            type={showPassword ? 'text' : 'password'}
                            {...step1Form.register('password')}
                            error={!!step1Form.formState.errors.password}
                            helperText={step1Form.formState.errors.password?.message}
                            InputProps={{
                                placeholder: 'Create a password',
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword((v) => !v)} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        {apiError && (
                            <Typography color="error" variant="caption">
                                {apiError.password}
                            </Typography>
                        )}
                        <TextField
                            label="Confirm password"
                            fullWidth
                            margin="normal"
                            type={showConfirm ? 'text' : 'password'}
                            {...step1Form.register('password_confirmation')}
                            error={!!step1Form.formState.errors.password_confirmation}
                            helperText={step1Form.formState.errors.password_confirmation?.message}
                            InputProps={{
                                placeholder: 'Confirm password',
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowConfirm((v) => !v)} edge="end">
                                            {showConfirm ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        {apiError && (
                            <Typography color="error" variant="caption">
                                {apiError.password_confirmation}
                            </Typography>
                        )}
                        <AppButton type="submit" fullWidth sx={{ mt: 3, mb: 2 }}>
                            Next
                        </AppButton>
                    </form>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Already have an account?{' '}
                            <MuiLink
                                component="button"
                                onClick={() => navigate('/login')}
                                sx={{ color: '#188600', fontWeight: 600, textDecoration: 'none' }}
                            >
                                Login now
                            </MuiLink>
                        </Typography>
                    </Box>
                </>
            )}

            {step === 2 && (
                <form onSubmit={step2Form.handleSubmit(handleRegister)} style={{ width: '100%' }}>
                    <TextField
                        label="Name"
                        fullWidth
                        margin="normal"
                        {...step2Form.register('name')}
                        error={!!step2Form.formState.errors.name}
                        helperText={step2Form.formState.errors.name?.message}
                        InputProps={{
                            placeholder: 'your name',
                        }}
                    />
                    {apiError && (
                        <Typography color="error" variant="caption">
                            {apiError.name}
                        </Typography>
                    )}
                    <TextField
                        label="Phone number"
                        fullWidth
                        margin="normal"
                        {...step2Form.register('phone')}
                        error={!!step2Form.formState.errors.phone}
                        helperText={step2Form.formState.errors.phone?.message}
                        InputProps={{
                            placeholder: '09-123456789',
                        }}
                    />
                    {apiError && (
                        <Typography color="error" variant="caption">
                            {apiError.phone}
                        </Typography>
                    )}
                    <TextField
                        label="Date of birth"
                        fullWidth
                        margin="normal"
                        {...step2Form.register('dob')}
                        error={!!step2Form.formState.errors.dob}
                        helperText={step2Form.formState.errors.dob?.message}
                        InputProps={{
                            placeholder: 'DD/MM/YY',
                            type: 'date',
                        }}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    {apiError && (
                        <Typography color="error" variant="caption">
                            {apiError.dob}
                        </Typography>
                    )}
                    <TextField
                        label="Location"
                        fullWidth
                        margin="normal"
                        select
                        defaultValue=""
                        {...step2Form.register('location')}
                        error={!!step2Form.formState.errors.location}
                        helperText={step2Form.formState.errors.location?.message}
                    >
                        {locations.map((loc) => (
                            <MenuItem key={loc} value={loc}>
                                {loc}
                            </MenuItem>
                        ))}
                    </TextField>
                    {apiError && (
                        <Typography color="error" variant="caption">
                            {apiError.location}
                        </Typography>
                    )}
                    <FormControlLabel
                        control={
                            <Controller
                                name="terms"
                                control={step2Form.control}
                                render={({ field }) => (
                                    <Checkbox
                                        {...field}
                                        checked={!!field.value}
                                        sx={{
                                            color: '#198d0f',
                                            '&.Mui-checked': { color: '#198d0f' },
                                        }}
                                    />
                                )}
                            />
                        }
                        label={
                            <span>
                                I&apos;ve read and agree with the{' '}
                                <a href="/terms-and-conditions" style={{ color: '#198d0f', fontWeight: 600, cursor: 'pointer' }}>
                                    Terms and Conditions
                                </a>{' '}
                                and the{' '}
                            </span>
                        }
                    />
                    {step2Form.formState.errors.terms && (
                        <Typography color="error" variant="caption">
                            {step2Form.formState.errors.terms.message}
                        </Typography>
                    )}
                    <AppButton type="submit" fullWidth sx={{ mt: 3, mb: 2 }}>
                        Register
                    </AppButton>
                </form>
            )}
        </Box>
    );
};

export default Register;
