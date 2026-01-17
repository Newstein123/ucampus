import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { Content } from '../types/contribution';

interface SubmitEditRequestModalProps {
    open: boolean;
    currentContent: Content;
    onClose: () => void;
    onSubmit: (contentKey: string, newValue: string, oldValue: string, note?: string) => Promise<void>;
    isLoading?: boolean;
    preselectedField?: string;
}

const CONTENT_FIELDS = [
    { key: 'problem', label: 'Problem' },
    { key: 'solution', label: 'Solution' },
    { key: 'impact', label: 'Who Benefits' },
    { key: 'description', label: 'Description' },
    { key: 'resources', label: 'Resources' },
    { key: 'references', label: 'References' },
];

const SubmitEditRequestModal: React.FC<SubmitEditRequestModalProps> = ({
    open,
    currentContent,
    onClose,
    onSubmit,
    isLoading = false,
    preselectedField,
}) => {
    const [selectedField, setSelectedField] = useState<string>(preselectedField || '');
    const [newValue, setNewValue] = useState<string>('');
    const [references, setReferences] = useState<string[]>([]);
    const [newReferenceUrl, setNewReferenceUrl] = useState<string>('');
    const [note, setNote] = useState<string>('');
    const [error, setError] = useState<string>('');

    // Parse references from content (can be string JSON or array)
    const parseReferences = (value: unknown): string[] => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                // If not JSON, treat as comma-separated or single value
                return value
                    .split(',')
                    .map((s: string) => s.trim())
                    .filter((s: string) => s);
            }
        }
        return [];
    };

    const handleFieldChange = useCallback((fieldKey: string) => {
        setSelectedField(fieldKey);
        const currentValue = currentContent[fieldKey as keyof Content] || '';

        if (fieldKey === 'references') {
            // Handle references as array
            const refs = parseReferences(currentValue);
            setReferences(refs);
            setNewValue('');
        } else {
            // Handle other fields as string
            setNewValue(typeof currentValue === 'string' ? currentValue : JSON.stringify(currentValue));
            setReferences([]);
        }
        setError('');
    }, [currentContent]);

    const handleAddReference = (e?: React.KeyboardEvent) => {
        if (e && e.key !== 'Enter') {
            return;
        }
        if (e) {
            e.preventDefault();
        }

        const trimmedUrl = newReferenceUrl.trim();
        if (!trimmedUrl) {
            return; // Don't show error for empty input
        }

        // Basic URL validation
        try {
            new URL(trimmedUrl);
        } catch {
            setError('Please enter a valid URL (e.g., https://example.com)');
            return;
        }

        if (references.includes(trimmedUrl)) {
            setError('This reference is already in the list');
            return;
        }

        setReferences([...references, trimmedUrl]);
        setNewReferenceUrl('');
        setError('');
    };

    const handleRemoveReference = (index: number) => {
        setReferences(references.filter((_, i) => i !== index));
    };

    // Reset when modal closes or set preselected field
    useEffect(() => {
        if (!open) {
            setSelectedField('');
            setNewValue('');
            setReferences([]);
            setNewReferenceUrl('');
            setNote('');
            setError('');
        } else if (preselectedField) {
            setSelectedField(preselectedField);
            handleFieldChange(preselectedField);
        }
    }, [open, preselectedField, handleFieldChange]);

    const handleSubmit = async () => {
        if (!selectedField) {
            setError('Please select a field to edit');
            return;
        }

        let newValueToSubmit: string;
        let oldValueStr: string;

        if (selectedField === 'references') {
            // Handle references as JSON array
            const currentRefs = parseReferences(currentContent.references);
            newValueToSubmit = JSON.stringify(references);
            oldValueStr = JSON.stringify(currentRefs);

            if (references.length === 0) {
                setError('Please add at least one reference link');
                return;
            }

            // Check if references changed
            if (JSON.stringify(references.sort()) === JSON.stringify(currentRefs.sort())) {
                setError('The references must be different from the current value');
                return;
            }
        } else {
            // Handle other fields as string
            const trimmedValue = newValue.trim();
            if (!trimmedValue) {
                setError('Please provide a new value');
                return;
            }

            const oldValue = currentContent[selectedField as keyof Content] || '';
            oldValueStr = typeof oldValue === 'string' ? oldValue : JSON.stringify(oldValue);

            if (trimmedValue === oldValueStr) {
                setError('The new value must be different from the current value');
                return;
            }

            newValueToSubmit = trimmedValue;
        }

        setError('');
        await onSubmit(selectedField, newValueToSubmit, oldValueStr, note.trim() || undefined);
    };

    const handleClose = () => {
        setSelectedField('');
        setNewValue('');
        setReferences([]);
        setNewReferenceUrl('');
        setNote('');
        setError('');
        onClose();
    };

    const currentFieldValue = selectedField ? currentContent[selectedField as keyof Content] || '' : '';
    const currentValueStr =
        selectedField === 'references'
            ? JSON.stringify(parseReferences(currentFieldValue))
            : typeof currentFieldValue === 'string'
              ? currentFieldValue
              : JSON.stringify(currentFieldValue);

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            PaperProps={{
                sx: {
                    borderRadius: 5,
                    p: 1,
                    width: 600,
                    maxWidth: '90vw',
                },
            }}
        >
            <DialogTitle sx={{ fontWeight: 700, fontSize: 18, pb: 0.5 }}>Submit Edit Request</DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                {/* Field Selection */}
                {!preselectedField && (
                    <>
                        <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>Select Field to Edit</Typography>
                        <FormControl
                            fullWidth
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    bgcolor: '#f9f9f9',
                                },
                            }}
                        >
                            <InputLabel>Field</InputLabel>
                            <Select value={selectedField} label="Field" onChange={(e) => handleFieldChange(e.target.value)} disabled={isLoading}>
                                {CONTENT_FIELDS.map((field) => (
                                    <MenuItem key={field.key} value={field.key}>
                                        {field.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </>
                )}

                {/* Current Value Display */}
                {selectedField && (
                    <Box sx={{ mb: 2 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>Current Value</Typography>
                        <Box
                            sx={{
                                p: 2,
                                bgcolor: '#f5f5f5',
                                borderRadius: 2,
                                border: '1px solid #e0e0e0',
                                maxHeight: 150,
                                overflow: 'auto',
                            }}
                        >
                            {selectedField === 'references' ? (
                                parseReferences(currentFieldValue).length > 0 ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {parseReferences(currentFieldValue).map((ref, idx) => (
                                            <Box
                                                key={idx}
                                                component="a"
                                                href={ref}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                sx={{
                                                    color: '#1976d2',
                                                    fontSize: 14,
                                                    textDecoration: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.5,
                                                    '&:hover': { textDecoration: 'underline' },
                                                }}
                                            >
                                                <LinkIcon sx={{ fontSize: 16 }} />
                                                {ref}
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    <Typography sx={{ fontSize: 14, color: '#666' }}>(empty)</Typography>
                                )
                            ) : (
                                <Typography sx={{ fontSize: 14, color: '#666', whiteSpace: 'pre-wrap' }}>{currentValueStr || '(empty)'}</Typography>
                            )}
                        </Box>
                    </Box>
                )}

                {/* New Value - Special handling for references */}
                {selectedField === 'references' ? (
                    <Box sx={{ mb: 2 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>New References</Typography>

                        {/* Current references list */}
                        {references.length > 0 && (
                            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {references.map((ref, idx) => (
                                    <Chip
                                        key={idx}
                                        label={ref}
                                        onDelete={() => handleRemoveReference(idx)}
                                        deleteIcon={<CloseIcon />}
                                        sx={{
                                            bgcolor: '#e8f5e9',
                                            color: '#1F8505',
                                            '& .MuiChip-deleteIcon': {
                                                color: '#1F8505',
                                            },
                                        }}
                                    />
                                ))}
                            </Box>
                        )}

                        {/* Add new reference */}
                        <TextField
                            fullWidth
                            placeholder="Add reference URL and press Enter (e.g., https://example.com)"
                            value={newReferenceUrl}
                            onChange={(e) => {
                                setNewReferenceUrl(e.target.value);
                                if (error) setError('');
                            }}
                            onKeyDown={handleAddReference}
                            error={!!error}
                            helperText={error}
                            disabled={isLoading}
                            sx={{
                                mb: 1,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    bgcolor: '#f9f9f9',
                                },
                            }}
                        />
                        {error && <Typography sx={{ fontSize: 12, color: 'error.main', mt: 0.5 }}>{error}</Typography>}
                    </Box>
                ) : (
                    <>
                        <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>New Value</Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={6}
                            placeholder="Enter the new value..."
                            value={newValue}
                            onChange={(e) => {
                                setNewValue(e.target.value);
                                if (error) setError('');
                            }}
                            error={!!error}
                            helperText={error}
                            disabled={isLoading || !selectedField}
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    bgcolor: '#f9f9f9',
                                },
                            }}
                        />
                    </>
                )}

                {/* Editor Note */}
                <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>Note (Optional)</Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Explain why this change is needed..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    disabled={isLoading}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            bgcolor: '#f9f9f9',
                        },
                    }}
                />
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2, px: 3 }}>
                <Button
                    onClick={handleClose}
                    variant="outlined"
                    disabled={isLoading}
                    sx={{
                        borderColor: '#1F8505',
                        color: '#1F8505',
                        minWidth: 120,
                        py: 1,
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                            borderColor: '#165d04',
                            bgcolor: 'rgba(31, 133, 5, 0.04)',
                        },
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={isLoading || !selectedField || (selectedField === 'references' ? references.length === 0 : !newValue.trim())}
                    sx={{
                        bgcolor: '#1F8505',
                        color: '#fff',
                        minWidth: 120,
                        py: 1,
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                            bgcolor: '#165d04',
                        },
                        '&:disabled': {
                            bgcolor: '#ccc',
                        },
                    }}
                >
                    {isLoading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={20} color="inherit" />
                            <span>Submitting...</span>
                        </Box>
                    ) : (
                        'Submit Request'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SubmitEditRequestModal;
