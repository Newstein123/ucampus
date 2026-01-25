<?php

namespace App\Filament\Resources\ContributionEditRequestResource\Pages;

use App\Filament\Resources\ContributionEditRequestResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListContributionEditRequests extends ListRecords
{
    protected static string $resource = ContributionEditRequestResource::class;

    protected function getHeaderActions(): array
    {
        return [
            //
        ];
    }
}

