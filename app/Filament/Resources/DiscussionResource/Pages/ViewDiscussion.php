<?php

namespace App\Filament\Resources\DiscussionResource\Pages;

use App\Filament\Resources\DiscussionResource;
use App\Models\Discussion;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewDiscussion extends ViewRecord
{
    protected static string $resource = DiscussionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make(),
            Actions\Action::make('lock')
                ->label('Lock Discussion')
                ->icon('heroicon-o-lock-closed')
                ->color('warning')
                ->requiresConfirmation()
                ->action(function () {
                    $this->record->update(['is_locked' => true]);
                    $this->redirect($this->getResource()::getUrl('index'));
                })
                ->visible(fn () => !$this->record->is_locked),
            Actions\Action::make('unlock')
                ->label('Unlock Discussion')
                ->icon('heroicon-o-lock-open')
                ->color('success')
                ->requiresConfirmation()
                ->action(function () {
                    $this->record->update(['is_locked' => false]);
                    $this->redirect($this->getResource()::getUrl('index'));
                })
                ->visible(fn () => $this->record->is_locked),
            Actions\DeleteAction::make(),
            Actions\RestoreAction::make(),
        ];
    }
}

