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
    contribution_bookmark: '/contribution',
    contribution_show: '/contributions/{id}',
    contribution_update: '/contributions/{id}',
    contribution_delete: '/contributions/{id}',
    contribution_upload_attachment: '/contributions/upload-attachment',
    contribution_delete_attachment: '/contributions/attachment/{id}',
    contribution_trending: '/contributions/trending',
    contribution_search: '/contributions/search',
    bookmark_list: '/contribution/bookmarks',

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
    collaboration_request: '/project/request',
    collaboration_action: '/project/action',

    auth_social_login: '/auth/{provider}/login',
    auth_forgot_password: '/auth/forgot-password',
    auth_reset_password: '/auth/reset-password',
    //   auth_verify_email: '/api/auth/verify-email',
    //   auth_resend_verification: '/api/auth/resend-verification',
    //   auth_update_onboarding: '/api/auth/update-onboarding',
    auth_change_password: '/auth/profile/edit/password',
    auth_update_profile: '/auth/profile/edit',
});
