<?php

use Illuminate\Support\Facades\Route;

// Serve the React app for all frontend routes
// React Router will handle the client-side routing
Route::get('/landing', function () {
    return view('landing');
});

Route::get('/terms-and-conditions', function () {
    return view('terms-and-conditions');
});

Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');
