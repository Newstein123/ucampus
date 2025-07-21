<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use App\Jobs\SendResetPasswordEmail;

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

    public function socialLogin($provider)
    {
        $url = \Laravel\Socialite\Facades\Socialite::driver($provider)->stateless()->redirect()->getTargetUrl();
        return [
            'url' => $url
        ];
    }

    public function socialLoginCallback($provider, $request)
    {
        $socialUser = \Laravel\Socialite\Facades\Socialite::driver($provider)->stateless()->user();
        $user = $this->users->findByEmail($socialUser->getEmail());
        if (!$user) {
            // Generate a unique username from email
            $baseUsername = strtolower(explode('@', $socialUser->getEmail())[0]);
            $username = $baseUsername;
            $counter = 1;
            // Check if username exists and generate a unique one
            while ($this->users->findByUsername($username)) {
                $username = $baseUsername . $counter;
                $counter++;
            }
            $user = $this->users->create([
                'name' => $socialUser->getName() ?? $socialUser->getNickname(),
                'username' => $username,
                'email' => $socialUser->getEmail(),
                'password' => \Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(16)),
                'dob' => '1990-01-01', // Default date of birth
                'location' => 'Unknown', // Default location
                'phone' => null, // Phone is nullable
            ]);
        }
        $account = \App\Models\SocialAccount::updateOrCreate(
            [
                'provider' => $provider,
                'provider_user_id' => $socialUser->getId(),
            ],
            [
                'user_id' => $user->id,
                'token' => $socialUser->token,
            ]
        );
        \Illuminate\Support\Facades\Auth::login($user);
        $token = $user->createToken($provider . '-login')->plainTextToken;
        return [
            'user' => $user,
            'token' => $token,
        ];
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

            $avatarPath = Storage::put('avatars', $data['avatar']);
            $data['avatar'] = $avatarPath;
        }

        $updatedUser = $this->users->update($user, $data);

        return $updatedUser;
    }

    public function forgotPassword(string $email)
    {
        $user = $this->users->findByEmail($email);

        if (!$user) {
            return [
                'success' => false,
                'message' => 'User not found',
                'data' => null
            ];
        }

        $token = Password::createToken($user);
        $resetUrl = env('RESET_PASSWORD_URL') . '?token=' . $token . '&email=' . urlencode($email);

        SendResetPasswordEmail::dispatch($user, $resetUrl);

        return [
            'success' => true,
            'message' => 'Reset Url Send Successfully',
            'data' => ['reset_url' => $resetUrl]
        ];
    }

    public function resetPassword(string $email, string $token, string $password)
    {
        $status = Password::reset(
            [
                'email' => $email,
                'token' => $token,
                'password' => $password,
                'password_confirmation' => $password
            ],
            function ($user, $password) {
                $user->password = Hash::make($password);
                $user->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return [
                'success' => true,
                'message' => 'Password Reset Successfully',
                'data' => null
            ];
        }

        return [
            'success' => false,
            'message' => __($status),
            'data' => null
        ];
    }
}
