# Real-Time Notification Testing Setup

## Prerequisites

1. **Laravel Reverb Server** - Make sure Reverb is running
2. **Environment Variables** - Set up the following in your `.env` file

## Environment Variables

Add these to your `.env` file:

```env
# Broadcasting
BROADCAST_CONNECTION=reverb

# Reverb Configuration
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret
REVERB_APP_ID=your-app-id
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

# Frontend Environment Variables (in .env or .env.local)
VITE_REVERB_APP_KEY=your-app-key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

## Testing Steps

1. **Start Laravel Reverb Server:**
   ```bash
   php artisan reverb:start
   ```

2. **Start your Laravel application:**
   ```bash
   php artisan serve
   ```

3. **Start your frontend:**
   ```bash
   npm run dev
   ```

4. **Test Real-Time Notifications:**
   - Navigate to `/notifications` page
   - Click "Send Test Notification" button
   - Check browser console for real-time logs
   - Watch the notification badge count update

## What to Look For

1. **Browser Console Logs:**
   - "Real-time notification received: [notification data]"
   - WebSocket connection status

2. **Visual Indicators:**
   - Notification badge count in header
   - New notification appearing in the list
   - Real-time updates without page refresh

3. **Network Tab:**
   - WebSocket connection to Reverb server
   - API calls to create test notifications

## Troubleshooting

1. **WebSocket Connection Issues:**
   - Check if Reverb server is running
   - Verify environment variables
   - Check browser console for connection errors

2. **No Real-Time Updates:**
   - Ensure user is authenticated
   - Check if notification listener is properly initialized
   - Verify event broadcasting is working

3. **Environment Variables:**
   - Make sure all REVERB_* variables are set
   - Frontend VITE_* variables should match backend
   - Restart servers after changing environment variables
