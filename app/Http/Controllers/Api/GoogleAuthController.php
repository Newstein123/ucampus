<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\AuthServiceInterface;

class GoogleAuthController extends Controller
{
    protected $authService;

    public function __construct(AuthServiceInterface $authService)
    {
        $this->authService = $authService;
    }

    
    public function redirectToGoogle()
    {
        $result = $this->authService->googleLogin();
        return response()->json($result);
    }

    
    public function handleGoogleCallback(Request $request)
    {
        $result = $this->authService->googleLoginCallback($request);
        return response()->json($result);
    }
} 