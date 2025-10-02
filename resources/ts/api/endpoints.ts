export const endpoints = Object.freeze({
    // Authentication endpoints
    auth_login: '/auth/login',
    auth_logout: '/auth/logout',
    auth_register: '/auth/register',
    auth_profile: '/user/profile',

    // Contribution endpoints
    contribution_list: '/contributions',
    contribution_create: '/contributions',
    contribution_interest: '/contributions',
    contribution_show: '/contributions/{id}',

    // Notification endpoints
    notification_list: '/notifications',
    notification_read: '/notifications',
    notification_unread_count: '/notifications/unread-count',
    notification_test: '/notifications/test',

    // Discussion endpoints
    discussion_list: '/discussions',
    discussion_responses: '/discussions/{id}/responses',
    discussion_create: '/discussions',
    discussion_update: '/{id}/discussion',
    discussion_delete: '/{id}/discussion',
    discussion_interest: '/{id}/discussion/interest',

    // Collaboration endpoints
    collaboration_list: '/project/collaboration',

    auth_social_login: '/auth/{provider}/login',
    auth_forgot_password: '/auth/forgot-password',
    auth_reset_password: '/auth/reset-password',
    //   auth_verify_email: '/api/auth/verify-email',
    //   auth_resend_verification: '/api/auth/resend-verification',
    //   auth_update_onboarding: '/api/auth/update-onboarding',
    auth_change_password: '/auth/profile/edit/password',
    //   auth_update_profile: '/api/auth/update-profile',
});
