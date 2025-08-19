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
use Illuminate\Support\Str;
use App\Models\SocialAccount;

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
        try {
            $url = Socialite::driver($provider)->stateless()->redirect()->getTargetUrl();
            return [
                'url' => $url
            ];
        } catch (\Exception $e) {
            \Log::error('AuthService socialLogin ERROR', [
                'provider' => $provider,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    public function socialLoginCallback($provider, $request)
    {
        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();

            $user = $this->users->findByEmail($socialUser->getEmail());
            $isNewUser = false;

            if (!$user) {
                // Use full email as username
                $username = $socialUser->getEmail();
                $user = $this->users->create([
                    'name' => $socialUser->getName() ?? $socialUser->getNickname(),
                    'username' => $username,
                    'email' => $socialUser->getEmail(),
                    'password' => Hash::make(Str::random(16)),
                    'dob' => null,
                    'location' => null,
                    'phone' => null,
                ]);
                $isNewUser = true;
            } else {
                \Log::info('AuthService socialLoginCallback EXISTING USER FOUND', [
                    'user_id' => $user->id,
                    'email' => $user->email
                ]);
            }
            // Update or create social account
            SocialAccount::updateOrCreate(
                [
                    'provider' => $provider,
                    'provider_user_id' => $socialUser->getId(),
                ],
                [
                    'user_id' => $user->id,
                    'token' => $socialUser->token,
                ]
            );

            Auth::login($user);

            // Update last login time
            $user->last_login_at = now();
            $user->save();

            $token = $user->createToken($provider . '-login')->plainTextToken;

            $result = [
                'user' => $user,
                'token' => $token,
                'first_login' => $isNewUser || !$user->last_login_at,
            ];

            \Log::info('AuthService socialLoginCallback SUCCESS', [
                'user_id' => $user->id,
                'has_token' => !empty($token),
                'first_login' => $result['first_login']
            ]);

            return $result;
        } catch (\Exception $e) {
            \Log::error('AuthService socialLoginCallback ERROR', [
                'provider' => $provider,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
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

        // Log the reset URL for debugging
        \Illuminate\Support\Facades\Log::info('Forgot password request', [
            'user_email' => $email,
            'reset_url' => $resetUrl,
            'env_reset_url' => env('RESET_PASSWORD_URL')
        ]);

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
