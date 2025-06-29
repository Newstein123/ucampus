import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { authApi } from '../../api/auth';
import { RegisterRequest, RegisterResponse } from '../../types/auth';
import { ErrorResponse } from '..';

const useUserRegisterMutation = () => {
    return useMutation<
        RegisterResponse,
        AxiosError<ErrorResponse>,
        RegisterRequest
    >({
        mutationKey: ['register'],
        mutationFn: authApi.register,
    });
};

export default useUserRegisterMutation;
