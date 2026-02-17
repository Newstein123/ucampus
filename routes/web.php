<?php

use App\Http\Controllers\ShareController;
use Illuminate\Support\Facades\Route;

// Serve the React app for all frontend routes
// React Router will handle the client-side routing
Route::get('/landing', function () {
    return view('landing');
});

// Sitemap for SEO
Route::get('/sitemap.xml', [\App\Http\Controllers\SitemapController::class, 'index']);

Route::get('/terms-and-conditions', function () {
    return view('terms-and-conditions');
});

// Share route for Open Graph meta tags (social media previews)
// Accepts both slug (new) and ID (legacy) formats
Route::get('/share/{type}/{slugOrId}', [ShareController::class, 'show'])
    ->where('type', 'idea|project|question');

// Exclude admin routes from catch-all (Filament handles /admin routes)
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '^(?!admin).*$');

