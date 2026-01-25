<?php

namespace App\Filament\Widgets;

use App\Models\Contribution;
use App\Models\ContributionEditRequest;
use App\Models\ContributionParticipant;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends BaseWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Total Users', User::count())
                ->description('All registered users')
                ->descriptionIcon('heroicon-o-users')
                ->color('success'),
            Stat::make('Total Contributions', Contribution::count())
                ->description('All contributions')
                ->descriptionIcon('heroicon-o-document-text')
                ->color('info'),
            Stat::make('Pending Edit Requests', ContributionEditRequest::where('status', 'pending')->count())
                ->description('Awaiting review')
                ->descriptionIcon('heroicon-o-clock')
                ->color('warning'),
            Stat::make('Pending Join Requests', ContributionParticipant::where('status', 'pending')->count())
                ->description('Contributor requests')
                ->descriptionIcon('heroicon-o-user-plus')
                ->color('warning'),
        ];
    }
}

