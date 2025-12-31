<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContributionRole;
use Illuminate\Http\JsonResponse;

class ContributionRoleController extends Controller
{
    /**
     * Get all active contribution roles
     */
    public function index(): JsonResponse
    {
        $roles = ContributionRole::where('is_active', true)
            ->orderBy('label')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Roles retrieved successfully',
            'data' => $roles,
        ]);
    }
}

