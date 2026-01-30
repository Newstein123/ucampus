import { zodResolver } from '@hookform/resolvers/zod';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Chip, CircularProgress, IconButton, Paper, Step, StepLabel, Stepper, Switch, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { contributionApi } from '../../api/contribution';
import AppButton from '../../components/AppButton';
import Toast from '../../components/Toast';
import { useDeleteAttachmentMutation, useUpdateContributionMutation } from '../../hooks';
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

const ProjectEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [activeStep, setActiveStep] = useState(0);
    const [tagInput, setTagInput] = useState('');
    const [referenceInput, setReferenceInput] = useState('');
    const navigate = useNavigate();
    const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<string | null>(null);
    const [uploadedAttachments, setUploadedAttachments] = useState<UploadedAttachment[]>([]);
    const [uploadingAttachments, setUploadingAttachments] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const updateMutation = useUpdateContributionMutation();
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

    // Load existing project data
    useEffect(() => {
        if (id) {
            const loadProject = async () => {
                try {
                    const res = await contributionApi.show(parseInt(id));
                    const project = res.data;

                    // Store thumbnail URL for display
                    if (project.thumbnail_url) {
                        setExistingThumbnailUrl(project.thumbnail_url);
                    }

                    // Map existing attachments to uploaded format
                    if (project.attachments && project.attachments.length > 0) {
                        const existingAttachments = project.attachments.map((att) => ({
                            id: att.id || 0, // Use attachment ID from database
                            url: att.url,
                            path: att.path || att.url,
                            name: att.name,
                            type: att.type || '',
                            size: att.size || 0,
                        }));
                        setUploadedAttachments(existingAttachments);
                    }

                    // Parse references from content
                    let references: string[] = [];
                    if (project.content?.references) {
                        try {
                            references =
                                typeof project.content.references === 'string' ? JSON.parse(project.content.references) : project.content.references;
                            if (!Array.isArray(references)) {
                                references = [];
                            }
                        } catch {
                            references = [];
                        }
                    }

                    reset({
                        title: project.title || '',
                        description: project.content?.description || '',
                        problem: project.content?.problem || '',
                        solution: project.content?.solution || '',
                        impact: project.content?.impact || project.content?.why_it_matters || '',
                        resources: project.content?.resources || '',
                        references: references,
                        tags: project.tags || [],
                        is_public: project.is_public || false,
                        allow_collab: project.allow_collab || false,
                        thumbnail: null,
                        attachments: [],
                    });
                } catch (error) {
                    console.error('Failed to load project:', error);
                    setToastMessage('Failed to load project');
                    setToastType('error');
                    setToastOpen(true);
                } finally {
                    setIsLoading(false);
                }
            };
            loadProject();
        }
    }, [id, reset]);

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
            const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                alert('Please select a valid image file (PNG, JPG, JPEG, or WEBP)');
                e.target.value = '';
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                alert('Image size must be less than 2MB');
                e.target.value = '';
                return;
            }
            setValue('thumbnail', file);
            setExistingThumbnailUrl(null);
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
                    .uploadAttachment(file, id ? parseInt(id) : undefined)
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

    const handleRemoveAttachment = async (idx: number) => {
        const attachment = uploadedAttachments[idx];

        // If attachment has an ID (was uploaded or exists in DB), delete it from server
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

    // Submit update
    const onSubmit = async (data: ProjectForm) => {
        if (!id) return;

        if (uploadingAttachments.size > 0) {
            alert('Please wait for all attachments to finish uploading before submitting.');
            return;
        }

        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('type', 'project');
        formData.append('status', 'active');
        formData.append('is_public', data.is_public ? '1' : '0');
        formData.append('allow_collab', data.allow_collab ? '1' : '0');

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

        // Handle references: send as JSON array
        if (data.references && Array.isArray(data.references) && data.references.length > 0) {
            formData.append('content[references]', JSON.stringify(data.references));
        } else {
            formData.append('content[references]', '');
        }

        if (data.tags && data.tags.length > 0) {
            data.tags.forEach((tag) => {
                formData.append('tags[]', tag);
            });
        }

        // Handle attachments: send new attachment IDs and IDs to delete
        const existingAttachmentIds = uploadedAttachments.filter((att) => att.id && att.id > 0).map((att) => att.id!);
        const currentAttachmentIds = uploadedAttachments.map((att) => att.id).filter((id): id is number => id !== undefined && id > 0);
        const newAttachmentIds = currentAttachmentIds.filter((id) => !existingAttachmentIds.includes(id));
        const deletedAttachmentIds = existingAttachmentIds.filter((id) => !currentAttachmentIds.includes(id));

        // Add new attachment IDs
        newAttachmentIds.forEach((attachmentId) => {
            formData.append('attachment_ids[]', attachmentId.toString());
        });

        // Add deleted attachment IDs
        deletedAttachmentIds.forEach((attachmentId) => {
            formData.append('delete_attachment_ids[]', attachmentId.toString());
        });

        // Handle thumbnail
        if (data.thumbnail && data.thumbnail instanceof File) {
            formData.append('thumbnail_url', data.thumbnail, data.thumbnail.name);
        } else if (!data.thumbnail && !existingThumbnailUrl) {
            formData.append('remove_thumbnail', '1');
        }

        updateMutation.mutate(
            { id: parseInt(id!), data: formData },
            {
                onSuccess: () => {
                    // Navigate to project detail page with success toast info in state
                    navigate(`/projects/${id}`, { replace: true, state: { toastMessage: 'Project updated successfully!', toastType: 'success' } });
                },
                onError: (error) => {
                    const err = error as { response?: { data?: { message?: string } } };
                    const errorMsg = err.response?.data?.message || 'Failed to update project';
                    setToastMessage(errorMsg);
                    setToastType('error');
                    setToastOpen(true);
                },
            },
        );
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

    // Renderers
    const renderStep1 = () => (
        <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
                Edit Project
            </Typography>
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
                            ) : existingThumbnailUrl ? (
                                <Box sx={{ position: 'relative', width: '100%', mb: 1 }}>
                                    <img
                                        src={existingThumbnailUrl}
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
                                        onClick={() => setExistingThumbnailUrl(null)}
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
            <AppButton fullWidth sx={{ mt: 3 }} onClick={handleStep1Next} disabled={!step1Valid}>
                Next
            </AppButton>
        </Box>
    );

    const renderStep2 = () => (
        <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
                Edit Project
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
                <AppButton sx={{ flex: 1 }} onClick={handleStep2Next} disabled={!step2Valid}>
                    Next
                </AppButton>
            </Box>
        </Box>
    );

    const renderStep3 = () => (
        <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
                Edit Project
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
                <AppButton
                    sx={{ flex: 1 }}
                    disabled={!step3Valid || updateMutation.isPending || uploadingAttachments.size > 0}
                    onClick={handleSubmit(onSubmit)}
                >
                    {updateMutation.isPending ? 'Updating' : uploadingAttachments.size > 0 ? 'Uploading attachments...' : 'Update'}
                </AppButton>
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
                <IconButton edge="start" sx={{ color: '#888' }} onClick={() => navigate(`/projects/${id}`, { replace: true })}>
                    <CloseIcon />
                </IconButton>
                <Typography sx={{ flex: 1, textAlign: 'center', fontWeight: 600 }}>Edit project – step {activeStep + 1}</Typography>
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

            {/* Toast */}
            <Toast open={toastOpen} message={toastMessage} type={toastType} onClose={() => setToastOpen(false)} />
        </Paper>
    );
};

export default ProjectEdit;
