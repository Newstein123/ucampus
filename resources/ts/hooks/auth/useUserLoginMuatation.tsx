import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { authApi } from '../../api/auth';
import { LoginRequest, AuthResponse } from '../../types/auth';
import { ErrorResponse } from '..';

const useUserLoginMutation = () => {
    return useMutation<
        AuthResponse,
        AxiosError<ErrorResponse>,
        LoginRequest
    >({
        mutationKey: ['login'],
        mutationFn: authApi.login,
    });
};

export default useUserLoginMutation;
