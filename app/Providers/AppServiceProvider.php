<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Services\AuthServiceInterface::class,
            \App\Services\AuthService::class
        );
        $this->app->bind(
            \App\Repositories\UserRepositoryInterface::class,
            \App\Repositories\UserRepository::class
        );
        $this->app->bind(
            \App\Repositories\ContributionRepositoryInterface::class,
            \App\Repositories\ContributionRepository::class
        );
        $this->app->bind(
            \App\Services\ContributionServiceInterface::class,
            \App\Services\ContributionService::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
