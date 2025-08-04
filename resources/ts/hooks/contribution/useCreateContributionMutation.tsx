import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { ErrorResponse } from '..';
import { contributionApi } from '../../api/contribution';
import { CreateContributionRequest, CreateContributionResponse } from '../../types/contribution';

const useCreateContributionMutation = () => {
    return useMutation<CreateContributionResponse, AxiosError<ErrorResponse>, CreateContributionRequest>({
        mutationKey: ['createContribution'],
        mutationFn: contributionApi.create,
    });
};

export default useCreateContributionMutation;
