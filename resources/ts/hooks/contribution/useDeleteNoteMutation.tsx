import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ErrorResponse } from '..';
import { contributionApi } from '../../api/contribution';
import { DeleteNoteResponse } from '../../types/contribution';

export const useDeleteNoteMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<DeleteNoteResponse, AxiosError<ErrorResponse>, number>({
        mutationKey: ['deleteNote'],
        mutationFn: (noteId) => contributionApi.deleteNote(noteId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contributionNotes'] });
        },
    });
};
