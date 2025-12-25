import { zodResolver } from '@hookform/resolvers/zod';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Chip, CircularProgress, IconButton, Paper, Switch, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { contributionApi } from '../../api/contribution';
import Toast from '../../components/Toast';

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

const QuestionEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [tagInput, setTagInput] = useState('');
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const {
        control,
        handleSubmit,
        setValue,
        getValues,
        reset,
        formState: { errors },
    } = useForm<QuestionForm>({
        resolver: zodResolver(questionSchema),
        defaultValues,
        mode: 'onTouched',
    });

    // Load existing question data
    useEffect(() => {
        if (id) {
            const loadQuestion = async () => {
                try {
                    const res = await contributionApi.show(parseInt(id));
                    const question = res.data;

                    reset({
                        question: question.title || question.content?.question || '',
                        thought: question.content?.thought || question.content?.description || '',
                        tags: question.tags || [],
                        is_public: question.is_public || false,
                    });
                } catch (error) {
                    console.error('Failed to load question:', error);
                    setToastMessage('Failed to load question');
                    setToastType('error');
                    setToastOpen(true);
                } finally {
                    setIsLoading(false);
                }
            };
            loadQuestion();
        }
    }, [id, reset]);

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

    const onSubmit = async (data: QuestionForm) => {
        if (!id) return;
        setIsSubmitting(true);

        try {
            await contributionApi.update(parseInt(id), {
                title: data.question,
                content: {
                    title: data.question,
                    question: data.question,
                    thought: data.thought,
                    description: data.thought,
                    answer: null,
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
                // @ts-expect-error - status is not yet in the official type definition
                status: 'active',
            });
            // Navigate to question detail page with success toast info in state
            navigate(`/questions/${id}`, { replace: true, state: { toastMessage: 'Question updated successfully!', toastType: 'success' } });
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            const errorMsg = err.response?.data?.message || 'Failed to update question';
            setToastMessage(errorMsg);
            setToastType('error');
            setToastOpen(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <CircularProgress sx={{ color: '#1F8505' }} />
            </Paper>
        );
    }

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
                <IconButton edge="start" sx={{ color: '#888' }} onClick={() => navigate(`/questions/${id}`, { replace: true })}>
                    <CloseIcon />
                </IconButton>
                <Typography sx={{ flex: 1, textAlign: 'center', fontWeight: 600 }}>Edit Question</Typography>
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
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Updating...' : 'Update'}
                </Button>
            </form>

            {/* Toast */}
            <Toast open={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
        </Paper>
    );
};

export default QuestionEdit;
