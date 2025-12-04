export interface ErrorResponse {
    errors: {
        [key: string]: string[] | string;
    };
    message: string;
}

// Auth hooks
export * from './auth/useForgotPasswordMutation';
export * from './auth/usePasswordUpdateMutation';
export * from './auth/useResetPasswordMutation';
export * from './auth/useSocialAuthQuery';
export * from './auth/useUserLoginMuatation';
export * from './auth/useUserLogoutMutation';
export * from './auth/useUserProfileQuery';
export * from './auth/useUserRegisterMutation';

// Contribution hooks
export * from './contribution/useContributionInterestMutation';
export * from './contribution/useContributionListInfiniteQuery';
export * from './contribution/useContributionListQuery';
export * from './contribution/useCreateContributionMutation';

// Notification hooks
export * from './notification/useNotificationListQuery';
export * from './notification/useNotificationReadMutation';
export * from './notification/useNotificationUnreadCountQuery';
export * from './useNotificationListener';
