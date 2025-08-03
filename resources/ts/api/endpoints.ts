export const endpoints = Object.freeze({
    // Authentication endpoints
    auth_login: '/auth/login',
    auth_logout: '/auth/logout',
    auth_register: '/auth/register',
    auth_profile: '/user/profile',

    // Contribution endpoints
    contribution_list: '/contributions',
    contribution_create: '/contributions',

    // Notification endpoints
    notification_list: '/notifications',
    notification_read: '/notifications',
    notification_unread_count: '/notifications/unread-count',

    //   auth_google_login: '/api/auth/login/google',
    //   auth_google_callback: '/api/auth/login/google/callback',
    auth_forgot_password: '/auth/forgot-password',
    auth_reset_password: '/auth/reset-password',
    //   auth_verify_email: '/api/auth/verify-email',
    //   auth_resend_verification: '/api/auth/resend-verification',
    //   auth_update_onboarding: '/api/auth/update-onboarding',
    auth_change_password: '/auth/profile/edit/password',
    //   auth_update_profile: '/api/auth/update-profile',
});
