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

Route::prefix('contributions')->group(function () {
    Route::get('/', [ContributionController::class, 'index']);
    Route::get('/{id}', [ContributionController::class, 'show'])->middleware('auth:sanctum')->name('contributions.show');
    Route::post('/', [ContributionController::class, 'store'])->middleware('auth:sanctum');
    Route::put('/{id}', [ContributionController::class, 'update'])->middleware('auth:sanctum');
    Route::delete('/{id}', [ContributionController::class, 'destroy'])->middleware('auth:sanctum');
    
    
    Route::prefix('{contributionId}')->middleware('auth:sanctum')->group(function () {
        
        Route::post('/collaborators/request', [CollaborationController::class, 'requestCollaboration']);
        Route::get('/collaborators', [CollaborationController::class, 'getCollaborators']);
        Route::put('/collaborators/{userId}/approve', [CollaborationController::class, 'approveCollaboration']);
        Route::put('/collaborators/{userId}/reject', [CollaborationController::class, 'rejectCollaboration']);
        
       
        Route::get('/tasks', [TaskController::class, 'index']);
        Route::post('/tasks', [TaskController::class, 'store']);
        Route::put('/tasks/{taskId}', [TaskController::class, 'update']);
        Route::delete('/tasks/{taskId}', [TaskController::class, 'destroy']);
        
       
        Route::get('/progress-updates', [ProgressController::class, 'index']);
        Route::post('/progress-updates', [ProgressController::class, 'store']);
    });
    Route::post('/{id}/interest', [ContributionController::class, 'interest'])->middleware('auth:sanctum');
});

Route::prefix('notifications')->group(function () {
    Route::get('/', [NotificationController::class, 'index'])->middleware('auth:sanctum');
    Route::post('/{id}/read', [NotificationController::class, 'read'])->middleware('auth:sanctum');
    Route::get('/unread-count', [NotificationController::class, 'unreadCount'])->middleware('auth:sanctum');
});
