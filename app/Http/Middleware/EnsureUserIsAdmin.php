<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Allow access to login page
        if ($request->routeIs('filament.admin.auth.login')) {
            return $next($request);
        }

        // Check if user is authenticated and is admin
        if (!auth()->check() || !auth()->user()->is_admin) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
            }
            
            // Redirect to admin login if not authenticated, or back if authenticated but not admin
            if (!auth()->check()) {
                return redirect()->route('filament.admin.auth.login');
            }
            
            return redirect()->back()->with('error', 'You do not have permission to access the admin panel.');
        }

        return $next($request);
    }
}

