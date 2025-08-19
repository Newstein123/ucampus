# Google OAuth Popup Integration Test Guide

## Overview
This implementation provides a popup-based Google OAuth login that works with both web and PWA environments.

## Features
- Popup-based OAuth flow (better UX than full page redirect)
- PWA-aware navigation after successful authentication
- Fallback to full page redirect if popup is blocked
- Proper error handling and user feedback
- Support for first-time user onboarding flow

## How it works

### Frontend Flow
1. User clicks "Google" button on login page
2. Frontend calls `/auth/google/login` to get OAuth URL
3. Opens popup window with Google OAuth URL
4. User completes OAuth in popup
5. Popup redirects to our callback with `popup=true` parameter
6. Backend returns HTML page that:
   - Stores auth data in localStorage
   - Sends postMessage to parent window
   - Closes popup automatically
7. Parent window receives message and:
   - Sets auth token in API client
   - Updates Redux state
   - Navigates to appropriate page (onboarding or home)

### Backend Flow
1. `/auth/{provider}/login` - Returns OAuth redirect URL
2. `/auth/{provider}/callback` - Handles OAuth callback
   - If `popup=true` parameter: Returns HTML page for popup
   - Otherwise: Returns JSON response for direct redirect

## Testing

### Prerequisites
1. Configure Google OAuth credentials in `.env`:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
   ```

2. Ensure Laravel Socialite is installed and configured

### Test Steps
1. Start the Laravel development server
2. Navigate to the login page
3. Click the "Google" button
4. Verify popup opens with Google OAuth
5. Complete OAuth flow
6. Verify popup closes and user is redirected to appropriate page

### PWA Testing
1. Install the app as PWA
2. Test the same flow in PWA mode
3. Verify navigation works correctly in standalone mode

## Error Handling
- Popup blocked: Falls back to full page redirect
- OAuth failure: Shows error message in popup
- Network errors: Handled gracefully with user feedback

## Files Modified
- `resources/ts/pages/Login.tsx` - Main login component with popup logic
- `resources/ts/api/auth.ts` - Social auth API methods
- `resources/ts/hooks/auth/useSocialAuthQuery.tsx` - React Query hook
- `resources/ts/types/auth.ts` - TypeScript types
- `app/Http/Controllers/Api/SocialAuthController.php` - Backend controller
- `app/Services/AuthService.php` - Auth service with social login
- `resources/views/auth/popup-callback.blade.php` - Popup callback view

## Security Considerations
- Uses HTTPS in production
- Validates OAuth state
- Proper token handling
- CSRF protection via Laravel
- Secure popup communication via postMessage
- Handles Cross-Origin-Opener-Policy (COOP) restrictions

## COOP (Cross-Origin-Opener-Policy) Handling
The implementation includes robust handling for COOP restrictions that modern browsers enforce:

### Problem
- Modern browsers block `window.closed` checks across origins for security
- `postMessage` communication may be blocked by COOP policies
- Popup windows may not be able to close themselves

### Solution
1. **Storage Event Communication**: Uses `localStorage` and `storage` events instead of `postMessage`
2. **Polling Fallback**: Implements polling mechanism to check for auth data
3. **Multiple Communication Channels**: 
   - `postMessage` (primary)
   - `localStorage` + `storage` events (fallback)
   - Direct polling (final fallback)
4. **Graceful Degradation**: Falls back to full page redirect if popup is blocked
5. **Success Page Fallback**: Provides a success page when popup can't close itself

### Implementation Details
- Removes dependency on `window.closed` checks
- Uses `localStorage` events for cross-origin communication
- Implements multiple fallback mechanisms
- Provides user-friendly error handling
