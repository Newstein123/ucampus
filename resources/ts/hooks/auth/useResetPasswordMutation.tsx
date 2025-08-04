import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { ErrorResponse } from '..';
import { authApi } from '../../api/auth';
import { ResetPasswordRequest, ResetPasswordResponse } from '../../types/auth';

const useResetPasswordMutation = () => {
    return useMutation<ResetPasswordResponse, AxiosError<ErrorResponse>, ResetPasswordRequest>({
        mutationKey: ['reset-password'],
        mutationFn: authApi.resetPassword,
    });
};

export default useResetPasswordMutation;
