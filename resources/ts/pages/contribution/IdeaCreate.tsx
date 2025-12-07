import { zodResolver } from '@hookform/resolvers/zod';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Chip, IconButton, Paper, Switch, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import useCreateContributionMutation from '../../hooks/contribution/useCreateContributionMutation';
import { IdeaForm, ideaSchema } from '../../schemas/idea';

const defaultValues: IdeaForm = {
    thumbnail: null,
    title: '',
    problem: '',
    thought: '',
    why_it_matters: '',
    tags: [],
    is_public: false,
};

const IdeaCreate: React.FC = () => {
    const [tagInput, setTagInput] = useState('');
    const navigate = useNavigate();
    const createContributionMutation = useCreateContributionMutation();
    const {
        control,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
    } = useForm<IdeaForm>({
        resolver: zodResolver(ideaSchema),
        defaultValues,
        mode: 'onTouched',
    });

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            setValue('tags', [...(getValues('tags') || []), tagInput.trim()]);
            setTagInput('');
            e.preventDefault();
        }
    };

    const handleRemoveTag = (tag: string) => {
        setValue(
            'tags',
            (getValues('tags') || []).filter((t) => t !== tag),
        );
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Validate file type
            const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                alert('Please select a valid image file (PNG, JPG, JPEG, or WEBP)');
                e.target.value = ''; // Reset input
                return;
            }
            // Validate file size (2MB max)
            if (file.size > 2 * 1024 * 1024) {
                alert('Image size must be less than 2MB');
                e.target.value = ''; // Reset input
                return;
            }
            setValue('thumbnail', file);
        }
    };

    const onSubmit = (data: IdeaForm) => {
        const formData = new FormData();

        formData.append('title', data.title);
        formData.append('type', 'idea');
        // Send boolean as "1" or "0" for Laravel FormData boolean validation
        formData.append('is_public', data.is_public ? '1' : '0');

        // Append content fields as array format for Laravel
        formData.append('content[title]', data.title);
        formData.append('content[problem]', data.problem);
        formData.append('content[thought]', data.thought);
        formData.append('content[why_it_matters]', data.why_it_matters);
        formData.append('content[description]', '');
        formData.append('content[question]', '');
        formData.append('content[answer]', '');
        formData.append('content[solution]', '');
        formData.append('content[impact]', '');
        formData.append('content[resources]', '');
        formData.append('content[references]', '');

        if (data.tags && data.tags.length > 0) {
            data.tags.forEach((tag) => {
                formData.append('tags[]', tag);
            });
        }

        if (data.thumbnail) {
            // Ensure it's a File object before appending
            if (data.thumbnail instanceof File) {
                // Append file with explicit filename to ensure proper MIME type detection
                formData.append('thumbnail_url', data.thumbnail, data.thumbnail.name);
            }
        }

        // Debug: Log FormData contents
        console.log('FormData contents:');
        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`${key}:`, value.name, value.type, value.size);
            } else {
                console.log(`${key}:`, value);
            }
        }

        createContributionMutation.mutate(formData, {
            onSuccess: () => {
                navigate('/contribution');
            },
            onError: () => {
                // Error handling can be added here if needed
            },
        });
    };

    return (
        <Paper
            elevation={0}
            sx={{
                maxWidth: 600,
                width: '100%',
                mx: 'auto',
                minHeight: '100vh',
                bgcolor: '#f7fafd',
                p: 2,
                pt: 5,
                borderRadius: 0,
                position: 'relative',
            }}
        >
            {/* Top bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton edge="start" sx={{ color: '#888' }}>
                    <CloseIcon onClick={() => navigate('/contribution/create')} />
                </IconButton>
                <Typography sx={{ flex: 1, textAlign: 'center', fontWeight: 600 }}>Idea Contribution</Typography>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Thumbnail Upload */}
                <Box sx={{ mb: 2 }}>
                    <input accept="image/*" id="thumbnail-upload" type="file" style={{ display: 'none' }} onChange={handleThumbnailChange} />
                    <Controller
                        name="thumbnail"
                        control={control}
                        render={({ field }) => (
                            <Box>
                                {field.value ? (
                                    <Box sx={{ position: 'relative', width: '100%', mb: 1 }}>
                                        <img
                                            src={URL.createObjectURL(field.value)}
                                            alt="thumb"
                                            style={{
                                                width: '100%',
                                                height: '400px',
                                                objectFit: 'cover',
                                                borderRadius: 8,
                                                display: 'block',
                                            }}
                                        />
                                        <IconButton
                                            onClick={() => setValue('thumbnail', null)}
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                bgcolor: 'rgba(0, 0, 0, 0.5)',
                                                color: '#fff',
                                                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
                                            }}
                                        >
                                            <CloseIcon />
                                        </IconButton>
                                    </Box>
                                ) : (
                                    <label htmlFor="thumbnail-upload" style={{ cursor: 'pointer', display: 'block' }}>
                                        <Box
                                            sx={{
                                                width: '100%',
                                                height: '400px',
                                                bgcolor: '#e8f5e9',
                                                borderRadius: 2,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '2px dashed #1F8505',
                                                '&:hover': { bgcolor: '#d4e6d5' },
                                            }}
                                        >
                                            <AddPhotoAlternateIcon sx={{ fontSize: 60, color: '#1F8505', mb: 1 }} />
                                            <Typography sx={{ color: '#1F8505', fontWeight: 600 }}>Click to upload thumbnail</Typography>
                                            <Typography variant="caption" sx={{ color: '#666', mt: 0.5 }}>
                                                Recommended: 600 x 400px
                                            </Typography>
                                        </Box>
                                    </label>
                                )}
                                {field.value && (
                                    <Typography variant="caption" sx={{ color: '#666', display: 'block', mt: 0.5 }}>
                                        {field.value.name}
                                    </Typography>
                                )}
                            </Box>
                        )}
                    />
                </Box>
                <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Title"
                            fullWidth
                            margin="normal"
                            placeholder="What is your idea?"
                            error={!!errors.title}
                            helperText={errors.title?.message}
                        />
                    )}
                />
                <Controller
                    name="problem"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Problem"
                            fullWidth
                            margin="normal"
                            multiline
                            minRows={3}
                            placeholder="What problem does this idea solve?"
                            error={!!errors.problem}
                            helperText={errors.problem?.message}
                        />
                    )}
                />
                <Controller
                    name="thought"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Thought"
                            fullWidth
                            margin="normal"
                            multiline
                            minRows={3}
                            placeholder="Share your thoughts about this idea"
                            error={!!errors.thought}
                            helperText={errors.thought?.message}
                        />
                    )}
                />
                <Controller
                    name="why_it_matters"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Why It Matters"
                            fullWidth
                            margin="normal"
                            multiline
                            minRows={3}
                            placeholder="Why does this idea matter?"
                            error={!!errors.why_it_matters}
                            helperText={errors.why_it_matters?.message}
                        />
                    )}
                />
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Add tag
                    </Typography>
                    <TextField
                        fullWidth
                        placeholder="Add tags (e.g., #research, #study)"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                    />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {(getValues('tags') || []).map((tag, idx) => (
                            <Chip key={idx} label={tag} onDelete={() => handleRemoveTag(tag)} sx={{ bgcolor: '#e8f5e9', color: '#1F8505' }} />
                        ))}
                    </Box>
                </Box>
                <Controller
                    name="is_public"
                    control={control}
                    render={({ field }) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} color="success" />
                            <Typography>Public Visibility</Typography>
                        </Box>
                    )}
                />
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{
                        bgcolor: '#1F8505',
                        color: '#fff',
                        fontWeight: 600,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: 18,
                        py: 1.5,
                        mt: 2,
                        '&:hover': { bgcolor: '#156c0c' },
                    }}
                    disabled={createContributionMutation.isPending}
                >
                    Submit
                </Button>
            </form>
        </Paper>
    );
};

export default IdeaCreate;
