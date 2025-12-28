import { zodResolver } from '@hookform/resolvers/zod';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Chip, IconButton, Paper, Step, StepLabel, Stepper, Switch, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { contributionApi } from '../../api/contribution';
import { useDeleteAttachmentMutation } from '../../hooks';
import useCreateContributionMutation from '../../hooks/contribution/useCreateContributionMutation';
import { ProjectForm, projectSchema } from '../../schemas/idea';

const steps = ["What's your idea?", 'Why it matters?', 'Make it real'];

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

const defaultValues: ProjectForm = {
    thumbnail: null,
    title: '',
    description: '',
    problem: '',
    solution: '',
    impact: '',
    resources: '',
    references: [],
    attachments: [],
    tags: [],
    allow_collab: false,
    is_public: false,
};

interface UploadedAttachment {
    id: number;
    url: string;
    path: string;
    name: string;
    type: string;
    size: number;
}

const ProjectCreate: React.FC = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [tagInput, setTagInput] = useState('');
    const [referenceInput, setReferenceInput] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const ideaId = searchParams.get('ideaId');
    const [ideaThumbnailUrl, setIdeaThumbnailUrl] = useState<string | null>(null);
    const [uploadedAttachments, setUploadedAttachments] = useState<UploadedAttachment[]>([]);
    const [uploadingAttachments, setUploadingAttachments] = useState<Set<number>>(new Set());
    const createContributionMutation = useCreateContributionMutation();
    const deleteAttachmentMutation = useDeleteAttachmentMutation();

    const {
        control,
        handleSubmit,
        setValue,
        getValues,
        watch,
        setError,
        reset,
        formState: { errors },
    } = useForm<ProjectForm>({
        resolver: zodResolver(projectSchema),
        defaultValues,
        mode: 'onTouched',
    });

    // Load idea data if ideaId is provided (upgrading from idea)
    useEffect(() => {
        if (ideaId) {
            const loadIdea = async () => {
                try {
                    const res = await contributionApi.show(parseInt(ideaId));
                    const idea = res.data;
                    // Store thumbnail URL separately for display
                    if (idea.thumbnail_url) {
                        setIdeaThumbnailUrl(idea.thumbnail_url);
                    }
                    reset({
                        title: idea.title || '',
                        description: idea.content?.description || '',
                        problem: idea.content?.problem || '',
                        solution: idea.content?.solution || '',
                        impact: idea.content?.why_it_matters || idea.content?.impact || '',
                        resources: idea.content?.resources || '',
                        tags: idea.tags || [],
                        is_public: idea.is_public || false,
                        allow_collab: idea.allow_collab || false,
                        thumbnail: null,
                        attachments: [],
                    });
                    // Clear uploaded attachments when loading idea
                    setUploadedAttachments([]);
                    setUploadingAttachments(new Set());
                } catch (error) {
                    console.error('Failed to load idea:', error);
                }
            };
            loadIdea();
        }
    }, [ideaId, reset]);

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
            // Clear idea thumbnail URL when new file is selected
            setIdeaThumbnailUrl(null);
        }
    };

    const handleAttachmentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const startIndex = (getValues('attachments') || []).length;

            // Add files to form state for display
            setValue('attachments', [...(getValues('attachments') || []), ...files]);

            // Upload files immediately (one by one)
            files.forEach((file, fileOffset) => {
                const fileIndex = startIndex + fileOffset;
                setUploadingAttachments((prev) => new Set(prev).add(fileIndex));

                contributionApi
                    .uploadAttachment(file)
                    .then((response) => {
                        setUploadedAttachments((prev) => [...prev, response.data]);
                    })
                    .catch((error) => {
                        console.error('Failed to upload attachment:', error);
                        alert(`Failed to upload ${file.name}. Please try again.`);
                        // Remove the file from form state if upload failed
                        setValue(
                            'attachments',
                            (getValues('attachments') || []).filter((_f: File, i: number) => i !== fileIndex),
                        );
                    })
                    .finally(() => {
                        setUploadingAttachments((prev) => {
                            const newSet = new Set(prev);
                            newSet.delete(fileIndex);
                            return newSet;
                        });
                    });
            });
        }
        // Reset input to allow selecting the same file again
        e.target.value = '';
    };

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

    const handleAddReference = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && referenceInput.trim()) {
            const url = referenceInput.trim();
            // Basic URL validation
            try {
                new URL(url);
                setValue('references', [...(getValues('references') || []), url]);
                setReferenceInput('');
            } catch {
                alert('Please enter a valid URL');
            }
            e.preventDefault();
        }
    };

    const handleRemoveReference = (reference: string) => {
        setValue(
            'references',
            (getValues('references') || []).filter((r) => r !== reference),
        );
    };

    const handleRemoveAttachment = async (idx: number) => {
        const attachment = uploadedAttachments[idx];

        // If attachment has an ID (was uploaded), delete it from server
        if (attachment?.id) {
            try {
                await deleteAttachmentMutation.mutateAsync(attachment.id);
            } catch (error) {
                console.error('Failed to delete attachment:', error);
                alert('Failed to delete attachment. Please try again.');
                return;
            }
        }

        // Remove from form state
        setValue(
            'attachments',
            (getValues('attachments') || []).filter((_attachment: File, i: number) => i !== idx),
        );
        // Remove from uploaded attachments
        setUploadedAttachments((prev) => prev.filter((_attachment, i) => i !== idx));
        // Remove from uploading set if present
        setUploadingAttachments((prev) => {
            const newSet = new Set(prev);
            newSet.delete(idx);
            return newSet;
        });
    };

    // Per-step validation handlers
    const handleStep1Next = () => {
        const result = ideaStep1Schema.safeParse({ title, description, thumbnail });
        if (result.success) {
            setActiveStep(1);
        } else {
            result.error.errors.forEach((err) => {
                setError(err.path[0] as keyof ProjectForm, { message: err.message });
            });
        }
    };
    const handleStep2Next = () => {
        const result = ideaStep2Schema.safeParse({ problem, solution, impact });
        if (result.success) {
            setActiveStep(2);
        } else {
            result.error.errors.forEach((err) => {
                setError(err.path[0] as keyof ProjectForm, { message: err.message });
            });
        }
    };
    // Helper function to convert image URL to File
    const urlToFile = async (url: string, filename: string): Promise<File> => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new File([blob], filename, { type: blob.type });
    };

    // Final submit uses full schema
    const onSubmit = async (data: ProjectForm) => {
        // Prevent submission if attachments are still uploading
        if (uploadingAttachments.size > 0) {
            alert('Please wait for all attachments to finish uploading before submitting.');
            return;
        }

        const formData = new FormData();

        formData.append('title', data.title);
        formData.append('type', 'project');
        formData.append('is_public', data.is_public ? '1' : '0');
        formData.append('allow_collab', data.allow_collab ? '1' : '0');

        // Append content fields as array format for Laravel
        formData.append('content[title]', data.title);
        formData.append('content[description]', data.description);
        formData.append('content[problem]', data.problem);
        formData.append('content[solution]', data.solution);
        formData.append('content[impact]', data.impact);
        formData.append('content[resources]', data.resources);
        formData.append('content[question]', '');
        formData.append('content[answer]', '');
        formData.append('content[thought]', '');
        formData.append('content[why_it_matters]', '');
        formData.append('content[references]', '');

        if (data.tags && data.tags.length > 0) {
            data.tags.forEach((tag) => {
                formData.append('tags[]', tag);
            });
        }

        // Handle thumbnail: use new file if selected, otherwise use idea thumbnail URL if available
        if (data.thumbnail && data.thumbnail instanceof File) {
            formData.append('thumbnail_url', data.thumbnail, data.thumbnail.name);
        } else if (ideaThumbnailUrl && !data.thumbnail) {
            // Convert idea thumbnail URL to File
            try {
                const filename = ideaThumbnailUrl.split('/').pop() || 'thumbnail.jpg';
                const thumbnailFile = await urlToFile(ideaThumbnailUrl, filename);
                formData.append('thumbnail_url', thumbnailFile, filename);
            } catch (error) {
                console.error('Failed to convert thumbnail URL to file:', error);
            }
        }

        // Handle attachments: send attachment IDs
        if (uploadedAttachments.length > 0) {
            uploadedAttachments.forEach((att) => {
                if (att.id) {
                    formData.append('attachment_ids[]', att.id.toString());
                }
            });
        }

        // Handle references: send as array of links
        if (data.references && Array.isArray(data.references) && data.references.length > 0) {
            formData.append('content[references]', JSON.stringify(data.references));
        } else {
            formData.append('content[references]', '');
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

    // Renderers
    const renderStep1 = () => (
        <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
                Brand New Project Creation
            </Typography>
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
                                        onClick={() => {
                                            setValue('thumbnail', null);
                                            // Restore idea thumbnail if it existed
                                            if (ideaThumbnailUrl) {
                                                setIdeaThumbnailUrl(ideaThumbnailUrl);
                                            }
                                        }}
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
                            ) : ideaThumbnailUrl ? (
                                <Box sx={{ position: 'relative', width: '100%', mb: 1 }}>
                                    <img
                                        src={ideaThumbnailUrl}
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
                                        onClick={() => setIdeaThumbnailUrl(null)}
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
                Brand New Project Creation
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
                <Button variant="outlined" sx={{ flex: 1, borderRadius: 2 }} onClick={handleBack}>
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
                Brand New Project Creation
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
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Attachments
                </Typography>
                <input accept="*" id="attachment-upload" type="file" multiple style={{ display: 'none' }} onChange={handleAttachmentChange} />
                <label htmlFor="attachment-upload">
                    <Button startIcon={<AttachFileIcon />} sx={{ mb: 1, textTransform: 'none', color: '#1F8505' }} component="span">
                        Add attachment
                    </Button>
                </label>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {uploadedAttachments.map((att, idx) => (
                        <Chip
                            key={att.id || idx}
                            label={uploadingAttachments.has(idx) ? `${att.name} (Uploading...)` : att.name}
                            onDelete={uploadingAttachments.has(idx) ? undefined : () => handleRemoveAttachment(idx)}
                            disabled={uploadingAttachments.has(idx)}
                            sx={{ bgcolor: uploadingAttachments.has(idx) ? '#f5f5f5' : '#e8f5e9', color: '#1F8505' }}
                        />
                    ))}
                </Box>
            </Box>
            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    References (Links)
                </Typography>
                <TextField
                    fullWidth
                    placeholder="Add reference URL and press Enter (e.g., https://example.com)"
                    value={referenceInput}
                    onChange={(e) => setReferenceInput(e.target.value)}
                    onKeyDown={handleAddReference}
                    sx={{ mb: 1 }}
                />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {(getValues('references') || []).map((ref, idx) => (
                        <Chip
                            key={idx}
                            label={ref}
                            onDelete={() => handleRemoveReference(ref)}
                            sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}
                            clickable
                            component="a"
                            href={ref}
                            target="_blank"
                            rel="noopener noreferrer"
                        />
                    ))}
                </Box>
            </Box>
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
                name="allow_collab"
                control={control}
                render={({ field }) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Switch checked={field.value || false} onChange={(e) => field.onChange(e.target.checked)} color="success" />
                        <Typography>Allow Contributions</Typography>
                    </Box>
                )}
            />
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
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" sx={{ flex: 1, borderRadius: 2 }} onClick={handleBack}>
                    Back
                </Button>
                <Button
                    variant="contained"
                    sx={{ flex: 1, bgcolor: '#1F8505', color: '#fff', fontWeight: 600, borderRadius: 2 }}
                    disabled={!step3Valid || createContributionMutation.isPending || uploadingAttachments.size > 0}
                    onClick={handleSubmit(onSubmit)}
                >
                    {uploadingAttachments.size > 0 ? 'Uploading attachments...' : 'Submit'}
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
                <Typography sx={{ flex: 1, textAlign: 'center', fontWeight: 600 }}>Create project – step {activeStep + 1}</Typography>
            </Box>
            {/* Stepper */}
            <Stepper
                activeStep={activeStep}
                alternativeLabel
                sx={{
                    '.MuiStepIcon-root.Mui-active': {
                        color: '#1F8505',
                    },
                }}
            >
                {steps.map((label) => (
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

export default ProjectCreate;
