import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { contributionApi } from '../../api/contribution';
import { CreateContributionRequest, CreateContributionResponse } from '../../types/contribution';
import { ErrorResponse } from '..';

const useCreateContributionMutation = () => {
    return useMutation<
        CreateContributionResponse,
        AxiosError<ErrorResponse>,
        CreateContributionRequest
    >({
        mutationKey: ['createContribution'],
        mutationFn: contributionApi.create,
    });
};

export default useCreateContributionMutation;
