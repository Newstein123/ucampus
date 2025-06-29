import { useQuery } from '@tanstack/react-query';
import { authApi } from '../../api/auth';

const useUserProfileQuery = () => {
    return useQuery({
        queryKey: ['userProfile'],
        queryFn: () => authApi.getProfile(),
    });
};

export default useUserProfileQuery;
