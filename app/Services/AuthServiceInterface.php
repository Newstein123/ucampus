<?php

namespace App\Services;

interface AuthServiceInterface
{
    public function register(array $data);
    public function login(array $data);
    public function socialLogin($provider);
    public function socialLoginCallback($provider, $request);
    public function logout($user);
    public function profile();
    public function updateProfile($user, array $data);
    public function forgotPassword(string $email);
    public function resetPassword(string $email, string $token, string $password);
}
