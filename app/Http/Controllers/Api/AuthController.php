<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\UserRegisterResource;
use App\Http\Resources\UserProfileResource;
use App\Http\Resources\UserLoginResource;
use App\Services\AuthServiceInterface;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\Auth\ChangePasswordRequest;



class AuthController extends Controller
{

    public function __construct(
        protected AuthServiceInterface $authService
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
        $user = Auth::user();
        $first_login = $user->last_login_at ? false : true;
        $user->last_login_at = now();
        $user->save();
        $result = $this->authService->login($request->validated());
        return $this->response([
            'user' => new UserLoginResource($result['user']),
            'token' => $result['token'],
            'first_login' => $first_login,
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

    public function updateProfile(UpdateProfileRequest $request)
    {
        $result = $this->authService->updateProfile($request->user(), $request->validated());
        return $this->response(new UserProfileResource($result), 'Profile updated successfully');
    }
    public function changePassword(ChangePasswordRequest $request)
    {
        $user = $request->user();

        $this->authService->updateProfile($user, [
            'password' => bcrypt($request->input('new_password'))
        ]);

        return $this->response(null, 'Password updated successfully');
    }
}
