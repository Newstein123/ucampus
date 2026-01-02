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
        $this->app->bind(
            \App\Repositories\TagRepositoryInterface::class,
            \App\Repositories\TagRepository::class
        );

        $this->app->bind(
            \App\Repositories\CollaborationRepositoryInterface::class,
            \App\Repositories\CollaborationRepository::class
        );
        $this->app->bind(
            \App\Services\CollaborationServiceInterface::class,
            \App\Services\CollaborationService::class
        );
        $this->app->bind(
            \App\Repositories\NotificationRepositoryInterface::class,
            \App\Repositories\NotificationRepository::class
        );
        $this->app->bind(
            \App\Services\NotificationServiceInterface::class,
            \App\Services\NotificationService::class
        );
        $this->app->bind(
            \App\Repositories\DiscussionRepositoryInterface::class,
            \App\Repositories\DiscussionRepository::class
        );
        $this->app->bind(
            \App\Services\DiscussionServiceInterface::class,
            \App\Services\DiscussionService::class
        );
        $this->app->bind(
            \App\Repositories\EditRequestRepositoryInterface::class,
            \App\Repositories\EditRequestRepository::class
        );
        $this->app->bind(
            \App\Services\EditRequestServiceInterface::class,
            \App\Services\EditRequestService::class
        );
        $this->app->bind(
            \App\Repositories\ContributionNoteRepositoryInterface::class,
            \App\Repositories\ContributionNoteRepository::class
        );
        $this->app->bind(
            \App\Services\ContributionNoteServiceInterface::class,
            \App\Services\ContributionNoteService::class
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
