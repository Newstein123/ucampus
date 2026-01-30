<?php

namespace App\Filament\Resources\ContributionResource\RelationManagers;

use App\Models\ContributionParticipant;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;

class ContributorsRelationManager extends RelationManager
{
    protected static string $relationship = 'participants';

    protected static ?string $recordTitleAttribute = 'user.name';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('user_id')
                    ->relationship('user', 'name')
                    ->required()
                    ->searchable()
                    ->preload()
                    ->disabled(),
                Forms\Components\Select::make('role_id')
                    ->relationship('role', 'label')
                    ->searchable()
                    ->preload()
                    ->disabled(),
                Forms\Components\Textarea::make('join_reason')
                    ->label('Join Reason')
                    ->disabled(),
                Forms\Components\Textarea::make('join_response')
                    ->label('Join Response')
                    ->disabled(),
                Forms\Components\Select::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'accepted' => 'Accepted',
                        'rejected' => 'Rejected',
                        'active' => 'Active',
                        'left' => 'Left',
                        'removed' => 'Removed',
                    ])
                    ->required()
                    ->disabled(fn ($record) => $record && !in_array($record->status, ['pending', 'active'])),
                Forms\Components\DateTimePicker::make('joined_at')
                    ->disabled(),
                Forms\Components\Textarea::make('left_reason')
                    ->label('Left Reason')
                    ->disabled(),
                Forms\Components\TextInput::make('left_action')
                    ->label('Left Action')
                    ->disabled(),
                Forms\Components\DateTimePicker::make('left_at')
                    ->disabled(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('user.name')
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->label('User')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('user.email')
                    ->label('Email')
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('role.label')
                    ->label('Role')
                    ->badge()
                    ->default('—'),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'accepted' => 'info',
                        'rejected' => 'danger',
                        'active' => 'success',
                        'left' => 'gray',
                        'removed' => 'danger',
                        default => 'gray',
                    })
                    ->sortable(),
                Tables\Columns\TextColumn::make('joined_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'accepted' => 'Accepted',
                        'rejected' => 'Rejected',
                        'active' => 'Active',
                        'left' => 'Left',
                        'removed' => 'Removed',
                    ]),
            ])
            ->headerActions([
                // No create action - contributors join via requests
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('approve')
                    ->label('Approve')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->action(function (ContributionParticipant $record) {
                        $record->update([
                            'status' => 'accepted',
                            'joined_at' => now(),
                        ]);
                    })
                    ->visible(fn (ContributionParticipant $record) => $record->status === 'pending'),
                Tables\Actions\Action::make('reject')
                    ->label('Reject')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->action(function (ContributionParticipant $record) {
                        $record->update([
                            'status' => 'rejected',
                        ]);
                    })
                    ->visible(fn (ContributionParticipant $record) => $record->status === 'pending'),
                Tables\Actions\Action::make('remove')
                    ->label('Remove')
                    ->icon('heroicon-o-user-minus')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->action(function (ContributionParticipant $record) {
                        $record->update([
                            'status' => 'removed',
                            'left_at' => now(),
                            'left_action' => 'admin_removed',
                        ]);
                    })
                    ->visible(fn (ContributionParticipant $record) => in_array($record->status, ['accepted', 'active'])),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }
}

