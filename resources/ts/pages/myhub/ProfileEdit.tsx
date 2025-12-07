import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import SinglePageLayout from '../../components/SinglePageLayout';
import { ErrorResponse } from '../../hooks';
import useUserProfileQuery from '../../hooks/auth/useUserProfileQuery';
import useUserProfileUpdateMutation from '../../hooks/auth/useUserProfileUpdateMutation';
import { UpdateProfileFormData, updateProfileSchema } from '../../schemas/auth';

const ProfileEdit: React.FC = () => {
    const { data: userProfile } = useUserProfileQuery();
    const navigate = useNavigate();
    const [apiValidationErrors, setApiValidationErrors] = useState<ErrorResponse['errors']>({});

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<UpdateProfileFormData>({
        resolver: zodResolver(updateProfileSchema),
        mode: 'onTouched',
        defaultValues: {
            name: '',
            username: '',
            email: '',
            phone: '',
            location: '',
            dob: '',
        },
    });

    const updateProfileMutation = useUserProfileUpdateMutation();

    // Populate form with user data when it loads
    useEffect(() => {
        if (userProfile?.data) {
            const user = userProfile.data;
            reset({
                name: user.name || '',
                username: user.username || '',
                email: user.email || '',
                phone: user.phone || '',
                location: user.location || '',
                dob: user.dob ? user.dob.split('T')[0] : '', // Format date for input[type="date"]
            });
        }
    }, [userProfile, reset]);

    const onSubmit = (data: UpdateProfileFormData) => {
        // Filter out empty strings and undefined values
        const profileData: Record<string, string> = {};
        Object.entries(data).forEach(([key, value]) => {
            if (value && value.trim() !== '') {
                profileData[key] = value.trim();
            }
        });

        updateProfileMutation.mutate(profileData, {
            onSuccess: () => {
                navigate('/myhub');
            },
            onError: (error: AxiosError<ErrorResponse>) => {
                if (error.response?.data.errors) {
                    setApiValidationErrors(error.response.data.errors);
                }
            },
        });
    };

    if (!userProfile) return null;

    return (
        <SinglePageLayout title="Edit Profile">
            <Paper elevation={0} sx={{ bgcolor: '#fff', borderRadius: 3, m: 2, p: 3 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 17, mb: 2 }}>Edit Profile</Typography>
                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Name"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                error={!!errors.name || !!apiValidationErrors.name}
                                helperText={
                                    errors.name?.message ||
                                    (apiValidationErrors.name
                                        ? Array.isArray(apiValidationErrors.name)
                                            ? apiValidationErrors.name[0]
                                            : apiValidationErrors.name
                                        : '')
                                }
                                sx={{ mb: 0, bgcolor: '#fff', borderRadius: 2 }}
                            />
                        )}
                    />

                    <Controller
                        name="username"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Username"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                error={!!errors.username || !!apiValidationErrors.username}
                                helperText={
                                    errors.username?.message ||
                                    (apiValidationErrors.username
                                        ? Array.isArray(apiValidationErrors.username)
                                            ? apiValidationErrors.username[0]
                                            : apiValidationErrors.username
                                        : '')
                                }
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
                                label="Email"
                                type="email"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                error={!!errors.email || !!apiValidationErrors.email}
                                helperText={
                                    errors.email?.message ||
                                    (apiValidationErrors.email
                                        ? Array.isArray(apiValidationErrors.email)
                                            ? apiValidationErrors.email[0]
                                            : apiValidationErrors.email
                                        : '')
                                }
                                sx={{ mb: 0, bgcolor: '#fff', borderRadius: 2 }}
                            />
                        )}
                    />

                    <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Phone"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                error={!!errors.phone || !!apiValidationErrors.phone}
                                helperText={
                                    errors.phone?.message ||
                                    (apiValidationErrors.phone
                                        ? Array.isArray(apiValidationErrors.phone)
                                            ? apiValidationErrors.phone[0]
                                            : apiValidationErrors.phone
                                        : '')
                                }
                                sx={{ mb: 0, bgcolor: '#fff', borderRadius: 2 }}
                            />
                        )}
                    />

                    <Controller
                        name="location"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Location"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                error={!!errors.location || !!apiValidationErrors.location}
                                helperText={
                                    errors.location?.message ||
                                    (apiValidationErrors.location
                                        ? Array.isArray(apiValidationErrors.location)
                                            ? apiValidationErrors.location[0]
                                            : apiValidationErrors.location
                                        : '')
                                }
                                sx={{ mb: 0, bgcolor: '#fff', borderRadius: 2 }}
                            />
                        )}
                    />

                    <Controller
                        name="dob"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Date of Birth"
                                type="date"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    max: new Date().toISOString().split('T')[0], // Prevent future dates
                                }}
                                error={!!errors.dob || !!apiValidationErrors.dob}
                                helperText={
                                    errors.dob?.message ||
                                    (apiValidationErrors.dob
                                        ? Array.isArray(apiValidationErrors.dob)
                                            ? apiValidationErrors.dob[0]
                                            : apiValidationErrors.dob
                                        : '')
                                }
                                sx={{ mb: 0, bgcolor: '#fff', borderRadius: 2 }}
                            />
                        )}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        sx={{
                            bgcolor: '#1F8505',
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: 16,
                            mt: 1,
                            mb: 2,
                            '&:hover': { bgcolor: '#176b03' },
                            py: 1.2,
                        }}
                        fullWidth
                        disabled={updateProfileMutation.isPending}
                    >
                        Save Changes
                    </Button>
                </Box>
            </Paper>
        </SinglePageLayout>
    );
};

export default ProfileEdit;
