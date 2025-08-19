<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContributionController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\SocialAuthController;
use App\Http\Controllers\Api\CollaborationController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\ProgressController;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;
use App\Models\Notification;

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
        'params' => $request->all()
    ]);
    return response()->json(['message' => 'Test callback working']);
});

// Test Google callback route specifically
Route::get('auth/google/callback', function (Request $request) {
    \Log::info('Google callback route hit', [
        'method' => $request->method(),
        'url' => $request->fullUrl(),
        'query_params' => $request->query(),
        'all_params' => $request->all()
    ]);
    return response()->json(['message' => 'Google callback route working']);
});

Route::prefix('contributions')->group(function () {
    Route::get('/', [ContributionController::class, 'index']);
    Route::get('/{id}', [ContributionController::class, 'show'])->middleware('auth:sanctum')->name('contributions.show');
    Route::post('/', [ContributionController::class, 'store'])->middleware('auth:sanctum');
    Route::put('/{id}', [ContributionController::class, 'update'])->middleware('auth:sanctum');
    Route::delete('/{id}', [ContributionController::class, 'destroy'])->middleware('auth:sanctum');
    Route::post('/{id}/interest', [ContributionController::class, 'interest'])->middleware('auth:sanctum');
});

// Project Collaboration Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/project/request', [CollaborationController::class, 'request']);
    Route::post('/project/action', [CollaborationController::class, 'action']);
    Route::get('/project/collaboration', [CollaborationController::class, 'list']);
});

Route::prefix('notifications')->group(function () {
    Route::get('/', [NotificationController::class, 'index'])->middleware('auth:sanctum');
    Route::post('/{id}/read', [NotificationController::class, 'read'])->middleware('auth:sanctum');
    Route::get('/unread-count', [NotificationController::class, 'unreadCount'])->middleware('auth:sanctum');
    Route::post('/test', [NotificationController::class, 'testNotification'])->middleware('auth:sanctum');
    Route::post('/test-broadcast', function (Request $request) {
        $user = $request->user();
        if (!$user) {
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
            'notification' => $notification
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
