<?php

use Illuminate\Support\Facades\Route;

// Serve the React app for all frontend routes
// React Router will handle the client-side routing
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');
