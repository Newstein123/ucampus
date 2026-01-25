<?php

namespace App\Filament\Resources\ContributionParticipantResource\Pages;

use App\Filament\Resources\ContributionParticipantResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListContributionParticipants extends ListRecords
{
    protected static string $resource = ContributionParticipantResource::class;

    protected function getHeaderActions(): array
    {
        return [
            //
        ];
    }
}

