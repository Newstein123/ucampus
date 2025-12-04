<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuthServiceInterface;
use Illuminate\Http\Request;

class SocialAuthController extends Controller
{
    protected $authService;

    public function __construct(AuthServiceInterface $authService)
    {
        $this->authService = $authService;
    }

    public function redirectToProvider($provider)
    {
        try {
            $result = $this->authService->socialLogin($provider);

            return $this->response($result, 'Google login successful');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get OAuth URL: '.$e->getMessage(),
            ], 500);
        }
    }

    public function handleProviderCallback($provider, Request $request)
    {

        try {
            $result = $this->authService->socialLoginCallback($provider, $request);
            // Always return a view that handles both popup and direct callback scenarios
            $token = $result['token'] ?? null;
            $user = $result['user'] ?? null;
            $firstLogin = $result['first_login'] ?? false;

            if ($token && $user) {
                $userData = [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'dob' => $user->dob,
                    'location' => $user->location,
                    'first_login' => $firstLogin,
                ];

                return response()->view('auth.popup-callback', [
                    'token' => $token,
                    'user' => json_encode($userData),
                    'success' => true,
                ]);
            } else {
                \Log::warning('SocialAuthController handleProviderCallback MISSING TOKEN OR USER', [
                    'has_token' => ! is_null($token),
                    'has_user' => ! is_null($user),
                ]);
            }

            return $this->response($result, 'Google login successful');
        } catch (\Exception $e) {
            // Return error response
            return response()->json([
                'success' => false,
                'message' => 'Authentication failed: '.$e->getMessage(),
            ], 500);
        }
    }
}
