import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { ErrorResponse } from '..';
import { authApi } from '../../api/auth';
import { UpdatePasswordRequest, UpdatePasswordResponse } from '../../types/auth';

const usePasswordUpdateMutation = () => {
    return useMutation<UpdatePasswordResponse, AxiosError<ErrorResponse>, UpdatePasswordRequest>({
        mutationKey: ['password-update'],
        mutationFn: authApi.changePassword,
    });
};

export default usePasswordUpdateMutation;
