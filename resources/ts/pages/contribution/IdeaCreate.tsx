import React, { useState } from 'react';
import {
    Box, Typography, TextField, Button, Stepper, Step, StepLabel, IconButton, Switch, Chip, Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { ideaSchema, IdeaForm } from '../../schemas/idea';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const steps = [
    "What's your idea?",
    "Why it matters?",
    "Make it real"
];

const ideaStep1Schema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    thumbnail: z.any().optional(),
});
const ideaStep2Schema = z.object({
    problem: z.string().min(1, 'Problem is required'),
    solution: z.string().min(1, 'Solution is required'),
    impact: z.string().min(1, 'Impact is required'),
});
const ideaStep3Schema = z.object({
    resources: z.string().min(1, 'Resources needed is required'),
    attachments: z.array(z.any()).optional(),
    tags: z.array(z.string()).optional(),
    allowContributions: z.boolean(),
    publicVisibility: z.boolean(),
});

const defaultValues: IdeaForm = {
    thumbnail: null,
    title: '',
    description: '',
    problem: '',
    solution: '',
    impact: '',
    resources: '',
    attachments: [],
    tags: [],
    allowContributions: false,
    publicVisibility: false,
};

const IdeaCreate: React.FC = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [tagInput, setTagInput] = useState('');
    const navigate = useNavigate();

    const {
        control,
        handleSubmit,
        setValue,
        getValues,
        watch,
        setError,
        formState: { errors }
    } = useForm<IdeaForm>({
        resolver: zodResolver(ideaSchema),
        defaultValues,
        mode: 'onTouched',
    });

    // Watchers for step validation
    const title = watch('title');
    const description = watch('description');
    const problem = watch('problem');
    const solution = watch('solution');
    const impact = watch('impact');
    const resources = watch('resources');
    const thumbnail = watch('thumbnail');

    // Step validation
    const step1Valid = !!title && !!description;
    const step2Valid = !!problem && !!solution && !!impact;
    const step3Valid = !!resources;

    // Handlers
    const handleBack = () => setActiveStep((s) => s - 1);

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setValue('thumbnail', e.target.files[0]);
    };

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

    // Per-step validation handlers
    const handleStep1Next = () => {
        const result = ideaStep1Schema.safeParse({ title, description, thumbnail });
        if (result.success) {
            setActiveStep(1);
        } else {
            result.error.errors.forEach(err => {
                setError(err.path[0] as any, { message: err.message });
            });
        }
    };
    const handleStep2Next = () => {
        const result = ideaStep2Schema.safeParse({ problem, solution, impact });
        if (result.success) {
            setActiveStep(2);
        } else {
            result.error.errors.forEach(err => {
                setError(err.path[0] as any, { message: err.message });
            });
        }
    };
    // Final submit uses full schema
    const onSubmit = (data: IdeaForm) => {
        // No API, just log
        console.log(data);
    };

    // Renderers
    const renderStep1 = () => (
        <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
                Brand New Idea Creation
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <input
                    accept="image/*"
                    id="thumbnail-upload"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handleThumbnailChange}
                />
                <label htmlFor="thumbnail-upload">
                    <Controller
                        name="thumbnail"
                        control={control}
                        render={({ field }) => (
                            <IconButton component="span" sx={{ width: 80, height: 80, bgcolor: '#e8f5e9', mb: 1 }}>
                                {field.value
                                    ? <img src={URL.createObjectURL(field.value)} alt="thumb" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                                    : <AddPhotoAlternateIcon sx={{ fontSize: 40, color: '#1F8505' }} />}
                            </IconButton>
                        )}
                    />
                </label>
                {getValues('thumbnail') && (
                    <Typography variant="caption" sx={{ mb: 1 }}>{getValues('thumbnail').name}</Typography>
                )}
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
                        placeholder="Explain your idea"
                        error={!!errors.description}
                        helperText={errors.description?.message}
                    />
                )}
            />
            <Button
                variant="contained"
                fullWidth
                sx={{ mt: 3, bgcolor: '#1F8505', color: '#fff', fontWeight: 600, borderRadius: 2, py: 1.5, fontSize: 18 }}
                onClick={handleStep1Next}
                disabled={!step1Valid}
            >
                Next
            </Button>
        </Box>
    );

    const renderStep2 = () => (
        <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
                Brand New Idea Creation
            </Typography>
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
                        placeholder="What is the problem?"
                        error={!!errors.problem}
                        helperText={errors.problem?.message}
                    />
                )}
            />
            <Controller
                name="solution"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="Solution"
                        fullWidth
                        margin="normal"
                        multiline
                        minRows={3}
                        placeholder="What is the solution?"
                        error={!!errors.solution}
                        helperText={errors.solution?.message}
                    />
                )}
            />
            <Controller
                name="impact"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="Impact & Who Benefit?"
                        fullWidth
                        margin="normal"
                        multiline
                        minRows={3}
                        placeholder="Impact & who benefit?"
                        error={!!errors.impact}
                        helperText={errors.impact?.message}
                    />
                )}
            />
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                    variant="outlined"
                    sx={{ flex: 1, borderRadius: 2 }}
                    onClick={handleBack}
                >
                    Back
                </Button>
                <Button
                    variant="contained"
                    sx={{ flex: 1, bgcolor: '#1F8505', color: '#fff', fontWeight: 600, borderRadius: 2 }}
                    onClick={handleStep2Next}
                    disabled={!step2Valid}
                >
                    Next
                </Button>
            </Box>
        </Box>
    );

    const renderStep3 = () => (
        <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
                Brand New Idea Creation
            </Typography>
            <Controller
                name="resources"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="Resources Needed"
                        fullWidth
                        margin="normal"
                        multiline
                        minRows={3}
                        placeholder="What do you think you need?"
                        error={!!errors.resources}
                        helperText={errors.resources?.message}
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
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                    variant="outlined"
                    sx={{ flex: 1, borderRadius: 2 }}
                    onClick={handleBack}
                >
                    Back
                </Button>
                <Button
                    variant="contained"
                    sx={{ flex: 1, bgcolor: '#1F8505', color: '#fff', fontWeight: 600, borderRadius: 2 }}
                    disabled={!step3Valid}
                    onClick={handleSubmit(onSubmit)}
                >
                    Submit
                </Button>
            </Box>
        </Box>
    );

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
                    Create idea – step {activeStep + 1}
                </Typography>
            </Box>
            {/* Stepper */}
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
                {steps.map((label, idx) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            {/* Step content */}
            {activeStep === 0 && renderStep1()}
            {activeStep === 1 && renderStep2()}
            {activeStep === 2 && renderStep3()}
        </Paper>
    );
};

export default IdeaCreate;