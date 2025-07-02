import React, { useState } from 'react';
import {
    Box, Typography, TextField, Button, IconButton, Switch, Chip, Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

const questionSchema = z.object({
    question: z.string().min(1, 'Question is required'),
    description: z.string().min(1, 'Description is required'),
    attachments: z.array(z.any()).optional(),
    tags: z.array(z.string()).optional(),
    publicVisibility: z.boolean(),
});

type QuestionForm = z.infer<typeof questionSchema>;

const defaultValues: QuestionForm = {
    question: '',
    description: '',
    attachments: [],
    tags: [],
    publicVisibility: false,
};

const QuestionCreate: React.FC = () => {
    const [tagInput, setTagInput] = useState('');
    const navigate = useNavigate();

    const {
        control,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors }
    } = useForm<QuestionForm>({
        resolver: zodResolver(questionSchema),
        defaultValues,
        mode: 'onTouched',
    });

    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setValue('attachments', [...(getValues('attachments') || []), e.target.files[0]]);
        }
    };

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            setValue('tags', [...(getValues('tags') || []), tagInput.trim()]);
            setTagInput('');
            e.preventDefault();
        }
    };

    const handleRemoveTag = (tag: string) => {
        setValue('tags', (getValues('tags') || []).filter(t => t !== tag));
    };

    const handleRemoveAttachment = (idx: number) => {
        setValue('attachments', (getValues('attachments') || []).filter((_: any, i: number) => i !== idx));
    };

    const onSubmit = (data: QuestionForm) => {
        // No API, just log
        console.log(data);
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
                borderRadius: 0,
                position: 'relative',
            }}
        >
            {/* Top bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton edge="start" sx={{ color: '#888' }}>
                    <CloseIcon onClick={() => navigate('/contribution/create')} />
                </IconButton>
                <Typography sx={{ flex: 1, textAlign: 'center', fontWeight: 600 }}>
                    Question Contribution
                </Typography>
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Controller
                    name="question"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Question"
                            fullWidth
                            margin="normal"
                            multiline
                            minRows={2}
                            placeholder="What you want to ask?"
                            error={!!errors.question}
                            helperText={errors.question?.message}
                        />
                    )}
                />
                <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Description"
                            fullWidth
                            margin="normal"
                            multiline
                            minRows={3}
                            placeholder="Explain your question"
                            error={!!errors.description}
                            helperText={errors.description?.message}
                        />
                    )}
                />
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Attachments</Typography>
                    <input
                        accept="*"
                        id="attachment-upload"
                        type="file"
                        style={{ display: 'none' }}
                        onChange={handleAttachmentChange}
                    />
                    <label htmlFor="attachment-upload">
                        <Button
                            startIcon={<AttachFileIcon />}
                            sx={{ mb: 1, textTransform: 'none', color: '#1F8505' }}
                            component="span"
                        >
                            Add attachment
                        </Button>
                    </label>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {(getValues('attachments') || []).map((file, idx) => (
                            <Chip
                                key={idx}
                                label={file.name}
                                onDelete={() => handleRemoveAttachment(idx)}
                                sx={{ bgcolor: '#e8f5e9', color: '#1F8505' }}
                            />
                        ))}
                    </Box>
                </Box>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Add tag</Typography>
                    <TextField
                        fullWidth
                        placeholder="Add tags (e.g., #research, #study)"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                    />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {(getValues('tags') || []).map((tag, idx) => (
                            <Chip
                                key={idx}
                                label={tag}
                                onDelete={() => handleRemoveTag(tag)}
                                sx={{ bgcolor: '#e8f5e9', color: '#1F8505' }}
                            />
                        ))}
                    </Box>
                </Box>
                <Controller
                    name="publicVisibility"
                    control={control}
                    render={({ field }) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Switch
                                checked={field.value}
                                onChange={e => field.onChange(e.target.checked)}
                                color="success"
                            />
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
                >
                    Submit
                </Button>
            </form>
        </Paper>
    );
};

export default QuestionCreate;