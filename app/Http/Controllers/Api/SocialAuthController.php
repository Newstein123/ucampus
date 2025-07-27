<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\AuthServiceInterface;

class SocialAuthController extends Controller
{
    protected $authService;

    public function __construct(AuthServiceInterface $authService)
    {
        $this->authService = $authService;
    }

    public function redirectToProvider($provider)
    {
        $result = $this->authService->socialLogin($provider);
        return response()->json($result);
    }

    public function handleProviderCallback($provider, Request $request)
    {
        $result = $this->authService->socialLoginCallback($provider, $request);
        return response()->json($result);
    }
} 