<?php

namespace App\Filament\Resources\ContributionEditRequestResource\Pages;

use App\Filament\Resources\ContributionEditRequestResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewContributionEditRequest extends ViewRecord
{
    protected static string $resource = ContributionEditRequestResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('approve')
                ->label('Approve')
                ->icon('heroicon-o-check-circle')
                ->color('success')
                ->requiresConfirmation()
                ->form([
                    \Filament\Forms\Components\Textarea::make('review_note')
                        ->label('Review Note (Optional)'),
                ])
                ->action(function (array $data) {
                    $this->record->update([
                        'status' => 'approved',
                        'reviewed_by' => auth()->id(),
                        'review_note' => $data['review_note'] ?? null,
                        'applied_at' => now(),
                    ]);
                    $this->redirect($this->getResource()::getUrl('index'));
                })
                ->visible(fn () => $this->record->status === 'pending'),
            Actions\Action::make('reject')
                ->label('Reject')
                ->icon('heroicon-o-x-circle')
                ->color('danger')
                ->requiresConfirmation()
                ->form([
                    \Filament\Forms\Components\Textarea::make('review_note')
                        ->label('Review Note')
                        ->required(),
                ])
                ->action(function (array $data) {
                    $this->record->update([
                        'status' => 'rejected',
                        'reviewed_by' => auth()->id(),
                        'review_note' => $data['review_note'],
                    ]);
                    $this->redirect($this->getResource()::getUrl('index'));
                })
                ->visible(fn () => $this->record->status === 'pending'),
        ];
    }
}

