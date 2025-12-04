<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Resources\UserLoginResource;
use App\Http\Resources\UserProfileResource;
use App\Http\Resources\UserRegisterResource;
use App\Services\AuthServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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

    public function socialLogin($provider, Request $request)
    {
        $result = $this->authService->socialLogin($provider);

        return $this->response([
            'link' => $result['url'],
        ], ucfirst($provider).' login successful');
    }

    public function socialLoginCallback($provider, Request $request)
    {
        $result = $this->authService->socialLoginCallback($provider, $request);

        return $this->response($result, $result['success'] ?? true ? ucfirst($provider).' login successful' : ucfirst($provider).' login failed');
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

        $new_password = bcrypt($request->input('new_password'));

        $this->authService->updateProfile($user, [
            'password' => $new_password,
        ]);

        return $this->response(null, 'Password updated successfully');
    }

    public function forgotPassword(ForgotPasswordRequest $request)
    {
        $result = $this->authService->forgotPassword($request->email);

        return $this->response(null, $result['message']);
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $result = $this->authService->resetPassword(
            $request->email,
            $request->token,
            $request->password
        );

        return $this->response(null, $result['message']);
    }
}
