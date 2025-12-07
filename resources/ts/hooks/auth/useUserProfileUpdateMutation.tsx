import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { ErrorResponse } from '..';
import { authApi } from '../../api/auth';
import { UpdateProfileRequest, UpdateProfileResponse } from '../../types/auth';

const useUserProfileUpdateMutation = () => {
    const queryClient = useQueryClient();

    return useMutation<UpdateProfileResponse, AxiosError<ErrorResponse>, UpdateProfileRequest>({
        mutationKey: ['profile-update'],
        mutationFn: authApi.updateProfile,
        onSuccess: () => {
            // Invalidate and refetch user profile
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
    });
};

export default useUserProfileUpdateMutation;
