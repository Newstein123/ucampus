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
    contribution_download_attachment: '/contributions/attachments/{id}/download',
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
    project_leave: '/project/leave',
    contribution_roles: '/contribution-roles',

    // Edit Request endpoints
    edit_request_create: '/contributions/{id}/edit-requests',
    edit_request_list: '/contributions/{id}/edit-requests',
    edit_request_approve: '/edit-requests/{id}/approve',
    edit_request_reject: '/edit-requests/{id}/reject',
    edit_request_my: '/my/edit-requests',

    // Tag endpoints
    tag_trending: '/tags/trending',
    tag_search: '/tags/search',

    // Contribution Note endpoints
    contribution_notes_list: '/contribution-notes',
    contribution_notes_create: '/contribution-notes',
    contribution_notes_update: '/contribution-notes/{id}',
    contribution_notes_delete: '/contribution-notes/{id}',
    contribution_notes_resolve: '/contribution-notes/{id}/resolve',
    contribution_notes_reject: '/contribution-notes/{id}/reject',

    auth_social_login: '/auth/{provider}/login',
    auth_forgot_password: '/auth/forgot-password',
    auth_reset_password: '/auth/reset-password',
    //   auth_verify_email: '/api/auth/verify-email',
    //   auth_resend_verification: '/api/auth/resend-verification',
    //   auth_update_onboarding: '/api/auth/update-onboarding',
    auth_change_password: '/auth/profile/edit/password',
    auth_update_profile: '/auth/profile/edit',

    // Contact endpoints
    contact_create: '/contact',
});
