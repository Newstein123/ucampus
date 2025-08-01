import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, InputAdornment, IconButton, Link } from '@mui/material';
import BackButton from '../../components/BackButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, ChangePasswordFormData } from '../../schemas/auth';
import usePasswordUpdateMutation from '../../hooks/auth/usePasswordUpdateMutation';
import { AxiosError } from 'axios';
import { ErrorResponse } from '../../hooks';
import { useNavigate } from 'react-router-dom';

const ChangePassword: React.FC = () => {
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { control, handleSubmit, formState: { errors } } = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
        mode: 'onTouched',
    });
    const [apiValidationErrors, setApiValidationErrors] = useState<ErrorResponse['errors']>({});

    const changePasswordMutation = usePasswordUpdateMutation();
    const navigate = useNavigate();
    const onSubmit = (data: ChangePasswordFormData) => {
        changePasswordMutation.mutate({
            old_password: data.oldPassword,
            new_password: data.newPassword,
            confirm_password: data.confirmPassword,
        }, {
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
    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', minHeight: '100vh', bgcolor: '#f7fafd', p: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, pt: 2, pb: 1, position: 'sticky', top: 0, bgcolor: '#f7fafd', zIndex: 10 }}>
                <BackButton />
                <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#222', flex: 1, textAlign: 'center', mr: 4 }}>
                    Change password
                </Typography>
            </Box>
            <Paper elevation={0} sx={{ bgcolor: '#fff', borderRadius: 3, m: 2, p: 3 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 17, mb: 2 }}>Change password</Typography>
                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Controller
                        name="oldPassword"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Enter Old Password"
                                type={showOld ? 'text' : 'password'}
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                error={!!errors.oldPassword}
                                helperText={errors.oldPassword?.message}
                                sx={{ mb: 0, bgcolor: '#fff', borderRadius: 2 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowOld((v) => !v)} edge="end" size="small">
                                                {showOld ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        )}
                    />
                    {apiValidationErrors.old_password && (
                        <Typography sx={{ color: 'red', fontSize: 12, mb: 1 }}>{apiValidationErrors.old_password}</Typography>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -1, mb: 1 }}>
                        <Link href="/forgot-password" sx={{ color: '#1F8505', fontWeight: 600, fontSize: 14, cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                            Forgot password?
                        </Link>
                    </Box>
                    <Controller
                        name="newPassword"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Enter New Password"
                                type={showNew ? 'text' : 'password'}
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                error={!!errors.newPassword}
                                helperText={errors.newPassword?.message}
                                sx={{ mb: 0, bgcolor: '#fff', borderRadius: 2 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowNew((v) => !v)} edge="end" size="small">
                                                {showNew ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        )}
                    />
                    {apiValidationErrors.new_password && (
                        <Typography sx={{ color: 'red', fontSize: 12, mb: 1 }}>{apiValidationErrors.new_password}</Typography>
                    )}
                    <Controller
                        name="confirmPassword"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Confirm Password"
                                type={showConfirm ? 'text' : 'password'}
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword?.message}
                                sx={{ mb: 0, bgcolor: '#fff', borderRadius: 2 }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowConfirm((v) => !v)} edge="end" size="small">
                                                {showConfirm ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        )}
                    />
                    {apiValidationErrors.confirm_password && (
                        <Typography sx={{ color: 'red', fontSize: 12, mb: 1 }}>{apiValidationErrors.confirm_password}</Typography>
                    )}
                    <Button type="submit" variant="contained" sx={{ bgcolor: '#1F8505', borderRadius: 2, fontWeight: 600, fontSize: 16, mt: 1, mb: 2, '&:hover': { bgcolor: '#176b03' }, py: 1.2 }} fullWidth disabled={changePasswordMutation.isPending}>
                        Continue
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default ChangePassword; 