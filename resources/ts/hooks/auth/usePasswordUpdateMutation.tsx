import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { authApi } from '../../api/auth';
import { UpdatePasswordRequest, UpdatePasswordResponse } from '../../types/auth';
import { ErrorResponse } from '..';

const usePasswordUpdateMutation = () => {
    return useMutation<
        UpdatePasswordResponse,
        AxiosError<ErrorResponse>,
        UpdatePasswordRequest
    >({
        mutationKey: ['password-update'],
        mutationFn: authApi.changePassword,
    });
};

export default usePasswordUpdateMutation;
