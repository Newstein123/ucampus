<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContributionController;
use App\Http\Controllers\Api\SocialAuthController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/login/{provider}', [AuthController::class, 'socialLogin']);
    Route::post('/login/{provider}/callback', [AuthController::class, 'socialLoginCallback']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::post('/profile/edit',[AuthController::class, 'updateProfile'])->middleware('auth:sanctum');
    Route::put('/profile/edit/password', [AuthController::class, 'changePassword'])->middleware('auth:sanctum');
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);
});

Route::middleware('auth:sanctum')->post('/user/profile', [AuthController::class, 'updateProfile']);
Route::middleware('auth:sanctum')->get('/user/profile', [AuthController::class, 'profile']);

Route::get('auth/{provider}/login', [SocialAuthController::class, 'redirectToProvider']);
Route::get('auth/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback']);

Route::prefix('contributions')->group(function () {
    Route::get('/', [ContributionController::class, 'index']);
    Route::get('/{id}', [ContributionController::class, 'show'])->middleware('auth:sanctum');
    Route::post('/', [ContributionController::class, 'store'])->middleware('auth:sanctum');
    Route::put('/{id}', [ContributionController::class, 'update'])->middleware('auth:sanctum');
    Route::delete('/{id}', [ContributionController::class, 'destroy'])->middleware('auth:sanctum');
});
