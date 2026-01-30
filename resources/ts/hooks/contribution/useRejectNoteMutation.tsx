import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ErrorResponse } from '..';
import { contributionApi } from '../../api/contribution';
import { CreateNoteResponse } from '../../types/contribution';

export const useRejectNoteMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<CreateNoteResponse, AxiosError<ErrorResponse>, number>({
        mutationKey: ['rejectNote'],
        mutationFn: (noteId) => contributionApi.rejectNote(noteId),
        onSuccess: () => {
            // Invalidate all contribution notes queries (including field-specific ones)
            queryClient.invalidateQueries({ queryKey: ['contributionNotes'] });
        },
    });
};
