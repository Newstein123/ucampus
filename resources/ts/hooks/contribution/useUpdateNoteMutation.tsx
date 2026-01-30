import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ErrorResponse } from '..';
import { contributionApi } from '../../api/contribution';
import { UpdateNoteRequest, UpdateNoteResponse } from '../../types/contribution';

interface UpdateNoteParams {
    noteId: number;
    data: UpdateNoteRequest;
}

export const useUpdateNoteMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<UpdateNoteResponse, AxiosError<ErrorResponse>, UpdateNoteParams>({
        mutationKey: ['updateNote'],
        mutationFn: ({ noteId, data }) => contributionApi.updateNote(noteId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contributionNotes'] });
        },
    });
};
