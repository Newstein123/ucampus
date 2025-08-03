import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { ErrorResponse } from '..';
import { authApi } from '../../api/auth';
import { RegisterRequest, RegisterResponse } from '../../types/auth';

const useUserRegisterMutation = () => {
    return useMutation<RegisterResponse, AxiosError<ErrorResponse>, RegisterRequest>({
        mutationKey: ['register'],
        mutationFn: authApi.register,
    });
};

export default useUserRegisterMutation;
