import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ErrorResponse } from '..';
import { contributionApi } from '../../api/contribution';
import { CreateNoteRequest, CreateNoteResponse } from '../../types/contribution';

export const useCreateNoteMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<CreateNoteResponse, AxiosError<ErrorResponse>, CreateNoteRequest>({
        mutationKey: ['createNote'],
        mutationFn: (data) => contributionApi.createNote(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['contributionNotes', variables.contribution_id] });
        },
    });
};
