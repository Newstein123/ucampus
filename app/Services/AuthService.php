<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Laravel\Socialite\Facades\Socialite;

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
            'phone' => $data['phone'],
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
        return $user;
    }

    public function updateProfile($user, array $data)
    {
        if (isset($data['avatar']) && $data['avatar'] instanceof UploadedFile) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            $avatarPath = $data['avatar']->store('avatars', 'public');
            $data['avatar'] = $avatarPath;
        }

        $updatedUser = $this->users->update($user, $data);

        return $updatedUser;
    }
}
