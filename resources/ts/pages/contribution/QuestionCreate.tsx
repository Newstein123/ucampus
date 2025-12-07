import { zodResolver } from '@hookform/resolvers/zod';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Chip, IconButton, Paper, Switch, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import useCreateContributionMutation from '../../hooks/contribution/useCreateContributionMutation';

const questionSchema = z.object({
    question: z.string().min(1, 'Question is required'),
    thought: z.string().min(1, 'Thought is required'),
    tags: z.array(z.string()).optional(),
    is_public: z.boolean(),
});

type QuestionForm = z.infer<typeof questionSchema>;

const defaultValues: QuestionForm = {
    question: '',
    thought: '',
    tags: [],
    is_public: false,
};

const QuestionCreate: React.FC = () => {
    const [tagInput, setTagInput] = useState('');
    const navigate = useNavigate();
    const createContributionMutation = useCreateContributionMutation();
    const {
        control,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
    } = useForm<QuestionForm>({
        resolver: zodResolver(questionSchema),
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

    const onSubmit = (data: QuestionForm) => {
        createContributionMutation.mutate(
            {
                title: data.question,
                content: {
                    title: data.question,
                    question: data.question,
                    thought: data.thought,
                    answer: null,
                    description: null,
                    problem: null,
                    solution: null,
                    impact: null,
                    why_it_matters: null,
                    resources: null,
                    references: null,
                },
                type: 'question',
                tags: data.tags || [],
                is_public: data.is_public,
            },
            {
                onSuccess: () => {
                    navigate('/contribution');
                },
                onError: () => {
                    // Error handling can be added here if needed
                },
            },
        );
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
                <Typography sx={{ flex: 1, textAlign: 'center', fontWeight: 600 }}>Question Contribution</Typography>
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
                            placeholder="Share your thoughts about this question"
                            error={!!errors.thought}
                            helperText={errors.thought?.message}
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
                >
                    Submit
                </Button>
            </form>
        </Paper>
    );
};

export default QuestionCreate;
