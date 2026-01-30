<?php

namespace App\Filament\Resources\ContributionParticipantResource\Pages;

use App\Filament\Resources\ContributionParticipantResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditContributionParticipant extends EditRecord
{
    protected static string $resource = ContributionParticipantResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make(),
        ];
    }
}

