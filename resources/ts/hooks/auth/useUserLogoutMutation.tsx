import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { authApi } from '../../api/auth';
import { LogoutResponse } from '../../types/auth';
import { ErrorResponse } from '..';

const useUserLogoutMutation = () => {
    return useMutation<
        LogoutResponse,
        AxiosError<ErrorResponse>,
        void
    >({
        mutationKey: ['logout'],
        mutationFn: authApi.logout,
    });
};

export default useUserLogoutMutation;
