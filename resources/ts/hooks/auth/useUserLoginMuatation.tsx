import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { ErrorResponse } from '..';
import { authApi } from '../../api/auth';
import { LoginRequest, LoginResponse } from '../../types/auth';

const useUserLoginMutation = () => {
    return useMutation<LoginResponse, AxiosError<ErrorResponse>, LoginRequest>({
        mutationKey: ['login'],
        mutationFn: authApi.login,
    });
};

export default useUserLoginMutation;
