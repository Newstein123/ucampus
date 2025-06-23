<?php

namespace App\Services;

interface AuthServiceInterface
{
    public function register(array $data);
    public function login(array $data);
    public function googleLogin($googleToken);
    public function googleLoginCallback($code);
    public function logout($user);
    public function profile();
}
