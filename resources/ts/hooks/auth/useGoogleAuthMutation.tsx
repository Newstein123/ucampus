import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { ErrorResponse } from '..';
import { authApi } from '../../api/auth';
import { SocialAuthResponse } from '../../types/auth';

const useSocialAuthQuery = (provider: string, enabled: boolean = false) => {
    return useQuery<SocialAuthResponse, AxiosError<ErrorResponse>>({
        queryKey: ['social-auth', provider],
        queryFn: () => authApi.socialAuth(provider),
        enabled,
    });
};

export default useSocialAuthQuery;
