<?php

namespace App\Services;

use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Auth;

class AuthService implements AuthServiceInterface
{
    public function __construct(
        protected UserRepository $users
    ) {}

    public function register(array $data)
    {
        $user = $this->users->create([
            'name' => $data['name'],
            'username' => $data['username'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'dob' => $data['dob'],
            'location' => $data['location'],
        ]);

        $token = $user->createToken('api_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    public function login(array $data)
    {
        $login = $data['login'];
        $user = $this->users->findByEmail($login) ?? $this->users->findByUsername($login) ?? $this->users->findByPhone($login);
        $token = $user->createToken('api_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    public function googleLogin($googleToken)
    {
        // This is a stub. Actual implementation will use Socialite.
        // $googleUser = Socialite::driver('google')->userFromToken($googleToken);
        // ...
        return [
            'success' => false,
            'message' => 'Google login not implemented yet',
        ];
    }

    public function googleLoginCallback($code)
    {
        // $googleUser = Socialite::driver('google')->userFromToken($code);
        // return [
        //     'success' => true,
        //     'message' => 'Google login successful',
        //     'data' => $googleUser,
        // ];
    }

    public function logout($user)
    {
        try {
            $user->currentAccessToken()->delete();
            return [
                'success' => true,
                'message' => 'Logout successful',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Logout failed',
                'error' => $e->getMessage(),
            ];
        }
    }

    public function profile()
    {
        $user = Auth::user();
        return [
            'success' => true,
            'message' => 'Profile retrieved successfully',
            'data' => $user,
        ];
    }
}
