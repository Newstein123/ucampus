<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\AuthService;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserRegisterResource;
use App\Http\Resources\UserProfileResource;
use App\Http\Resources\UserLoginResource;

class AuthController extends Controller
{

    public function __construct(
        protected AuthService $authService
    ) {}

    public function register(RegisterRequest $request)
    {
        $result = $this->authService->register($request->validated());
        return $this->response([
            'user' => new UserRegisterResource($result['user']),
            'token' => $result['token'],
        ], 'Registration successful');
    }

    public function login(LoginRequest $request)
    {
        $result = $this->authService->login($request->validated());
        return $this->response([
            'user' => new UserLoginResource($result['user']),
            'token' => $result['token'],
        ], 'Login successful');
    }

    public function googleLogin(Request $request)
    {
        $result = $this->authService->googleLogin($request->input('token'));
        return $this->response([
            'link' => $result['link'],
        ], 'Google login successful');
    }

    public function googleLoginCallback(Request $request)
    {
        $result = $this->authService->googleLoginCallback($request->input('code'));
        return $this->response($result, $result['success'] ? 'Google login successful' : 'Google login failed');
    }

    public function logout(Request $request)
    {
        $result = $this->authService->logout($request->user());
        return $this->response(null, 'Logged out successfully');
    }

    public function profile(Request $request)
    {
        $result = $this->authService->profile();
        return $this->response(new UserProfileResource($result), 'Profile retrieved successfully');
    }
}
