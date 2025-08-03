import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { ErrorResponse } from '..';
import { authApi } from '../../api/auth';
import { LogoutResponse } from '../../types/auth';

const useUserLogoutMutation = () => {
    return useMutation<LogoutResponse, AxiosError<ErrorResponse>, void>({
        mutationKey: ['logout'],
        mutationFn: authApi.logout,
    });
};

export default useUserLogoutMutation;
