<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContributionController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/login/google', [AuthController::class, 'googleLogin']);
    Route::post('/login/google/callback', [AuthController::class, 'googleLoginCallback']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::post('/profile/edit',[AuthController::class, 'updateProfile'])->middleware('auth:sanctum');
    Route::put('/profile/edit/password', [AuthController::class, 'changePassword'])->middleware('auth:sanctum');
});

Route::middleware('auth:sanctum')->post('/user/profile', [AuthController::class, 'updateProfile']);
Route::middleware('auth:sanctum')->get('/user/profile', [AuthController::class, 'profile']);

Route::group(['prefix' => 'contributions'], function () {
    Route::get('/', [ContributionController::class, 'index']);
    Route::get('/{id}', [ContributionController::class, 'show']);
    Route::post('/', [ContributionController::class, 'store']);
    Route::put('/{id}', [ContributionController::class, 'update']);
    Route::delete('/{id}', [ContributionController::class, 'destroy']);
});
