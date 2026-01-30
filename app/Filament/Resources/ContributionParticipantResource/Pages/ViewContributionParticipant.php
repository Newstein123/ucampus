<?php

namespace App\Filament\Resources\ContributionParticipantResource\Pages;

use App\Filament\Resources\ContributionParticipantResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewContributionParticipant extends ViewRecord
{
    protected static string $resource = ContributionParticipantResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
        ];
    }
}

