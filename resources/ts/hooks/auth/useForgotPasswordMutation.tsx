import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { ErrorResponse } from '..';
import { authApi } from '../../api/auth';
import { ForgotPasswordRequest, ForgotPasswordResponse } from '../../types/auth';

const useForgotPasswordMutation = () => {
    return useMutation<ForgotPasswordResponse, AxiosError<ErrorResponse>, ForgotPasswordRequest>({
        mutationKey: ['forgot-password'],
        mutationFn: authApi.forgotPassword,
    });
};

export default useForgotPasswordMutation;
