<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookmarkController;
use App\Http\Controllers\Api\CollaborationController;
use App\Http\Controllers\Api\ContributionController;
use App\Http\Controllers\Api\ContributionNoteController;
use App\Http\Controllers\Api\DiscussionController;
use App\Http\Controllers\Api\EditRequestController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\SocialAuthController;
use App\Http\Controllers\Api\TagController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/login/{provider}', [AuthController::class, 'socialLogin']);
    Route::post('/login/{provider}/callback', [AuthController::class, 'socialLoginCallback']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::post('/profile/edit', [AuthController::class, 'updateProfile'])->middleware('auth:sanctum');
    Route::put('/profile/edit/password', [AuthController::class, 'changePassword'])->middleware('auth:sanctum');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

Route::middleware('auth:sanctum')->post('/user/profile', [AuthController::class, 'updateProfile']);
Route::middleware('auth:sanctum')->get('/user/profile', [AuthController::class, 'profile']);

Route::get('auth/{provider}/login', [SocialAuthController::class, 'redirectToProvider']);
Route::get('auth/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback']);

// Fallback route for popup success (when COOP blocks window.close)
Route::get('auth/success', function () {
    return view('auth.popup-success');
});

// Test route to verify callback is working
Route::get('auth/test-callback', function (Request $request) {
    \Log::info('Test callback route hit', [
        'method' => $request->method(),
        'url' => $request->fullUrl(),
        'params' => $request->all(),
    ]);

    return response()->json(['message' => 'Test callback working']);
});

// Test Google callback route specifically
Route::get('auth/google/callback', function (Request $request) {
    \Log::info('Google callback route hit', [
        'method' => $request->method(),
        'url' => $request->fullUrl(),
        'query_params' => $request->query(),
        'all_params' => $request->all(),
    ]);

    return response()->json(['message' => 'Google callback route working']);
});

Route::prefix('contributions')->group(function () {
    Route::get('/', [ContributionController::class, 'index'])->middleware('auth:sanctum');
    Route::get('/search', [ContributionController::class, 'search'])->middleware('auth:sanctum');
    Route::get('/trending', [ContributionController::class, 'trending'])->middleware('auth:sanctum');
    Route::get('/{id}', [ContributionController::class, 'show'])->middleware('auth:sanctum')->name('contributions.show');
    Route::post('/', [ContributionController::class, 'store'])->middleware('auth:sanctum');
    Route::post('/upload-attachment', [ContributionController::class, 'uploadAttachment'])->middleware('auth:sanctum');
    Route::delete('/attachment/{id}', [ContributionController::class, 'deleteAttachment'])->middleware('auth:sanctum');
    Route::put('/{id}', [ContributionController::class, 'update'])->middleware('auth:sanctum');
    Route::delete('/{id}', [ContributionController::class, 'destroy'])->middleware('auth:sanctum');
    Route::post('/{id}/interest', [ContributionController::class, 'interest'])->middleware('auth:sanctum');

    // Edit Requests Routes
    Route::post('/{id}/edit-requests', [EditRequestController::class, 'store'])->middleware('auth:sanctum');
    Route::get('/{id}/edit-requests', [EditRequestController::class, 'index'])->middleware('auth:sanctum');
});

// Project leave route
Route::middleware('auth:sanctum')->post('/project/leave', [ContributionController::class, 'leave']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('contribution/{id}/bookmarks', [BookmarkController::class, 'store']);
    Route::delete('contribution/{id}/bookmarks', [BookmarkController::class, 'destroy']);
    Route::get('contribution/bookmarks', [BookmarkController::class, 'index']);
});

// Project Collaboration Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/project/request', [CollaborationController::class, 'request']);
    Route::post('/project/action', [CollaborationController::class, 'action']);
    Route::get('/project/collaboration', [CollaborationController::class, 'list']);
});

// Contribution Roles Routes
Route::middleware('auth:sanctum')->get('/contribution-roles', [\App\Http\Controllers\Api\ContributionRoleController::class, 'index']);

// Tag Routes
Route::get('/tags/trending', [TagController::class, 'trending']);
Route::get('/tags/search', [TagController::class, 'search']);

// Edit Requests Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/edit-requests/{id}/approve', [EditRequestController::class, 'approve']);
    Route::post('/edit-requests/{id}/reject', [EditRequestController::class, 'reject']);
    Route::get('/my/edit-requests', [EditRequestController::class, 'myRequests']);
});

// Contribution Notes Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('contribution-notes')->group(function () {
        Route::get('/', [ContributionNoteController::class, 'index']);
        Route::post('/', [ContributionNoteController::class, 'store']);
        Route::put('/{id}', [ContributionNoteController::class, 'update']);
        Route::delete('/{id}', [ContributionNoteController::class, 'destroy']);
    });
});

Route::prefix('notifications')->group(function () {
    Route::get('/', [NotificationController::class, 'index'])->middleware('auth:sanctum');
    Route::post('/{id}/read', [NotificationController::class, 'read'])->middleware('auth:sanctum');
    Route::get('/unread-count', [NotificationController::class, 'unreadCount'])->middleware('auth:sanctum');
    Route::post('/test', [NotificationController::class, 'testNotification'])->middleware('auth:sanctum');
    Route::post('/test-broadcast', function (Request $request) {
        $user = $request->user();
        if (! $user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }

        // Create a test notification
        $notification = \App\Models\Notification::create([
            'recipient_user_id' => $user->id,
            'type' => 'test',
            'message' => 'Test notification from API',
            'redirect_url' => '/test',
            'is_read' => false,
        ]);

        // Broadcast the event
        broadcast(new \App\Events\NotificationCreated($notification));

        return response()->json([
            'message' => 'Test notification created and broadcasted',
            'notification' => $notification,
        ]);
    })->middleware('auth:sanctum');
});

// Broadcasting authentication route
Route::post('/broadcasting/auth', function (Request $request) {
    Log::info('Broadcasting auth attempt', [
        'headers' => $request->headers->all(),
        'user' => $request->user()?->id,
        'socket_id' => $request->input('socket_id'),
        'channel_name' => $request->input('channel_name'),
    ]);

    return Broadcast::auth($request);
})->middleware('auth:sanctum');

// Debug route to test broadcasting auth
Route::post('/broadcasting/debug', function (Request $request) {
    return response()->json([
        'message' => 'Broadcasting debug endpoint',
        'user' => $request->user()?->id,
        'headers' => $request->headers->all(),
        'body' => $request->all(),
    ]);
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('discussions')->group(function () {
        Route::get('/', [DiscussionController::class, 'getAllParentDiscussions']);
        Route::get('/{id}/responses', [DiscussionController::class, 'getAllResponses']);
        Route::post('/', [DiscussionController::class, 'store']);
    });
    Route::put('/{id}/discussion', [DiscussionController::class, 'update']);
    Route::delete('/{id}/discussion', [DiscussionController::class, 'delete']);
    Route::post('/{id}/discussion/interest', [DiscussionController::class, 'updateInterest']);
});
