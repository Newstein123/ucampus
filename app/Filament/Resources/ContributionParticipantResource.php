<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ContributionParticipantResource\Pages;
use App\Models\ContributionParticipant;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;

class ContributionParticipantResource extends Resource
{
    protected static ?string $model = ContributionParticipant::class;

    protected static ?string $navigationIcon = 'heroicon-o-user-group';

    protected static ?string $navigationGroup = 'Collaboration';

    protected static ?int $navigationSort = 1;

    protected static ?string $navigationLabel = 'Contributors';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('contribution_id')
                    ->relationship('contribution', 'title')
                    ->required()
                    ->searchable()
                    ->preload()
                    ->disabled(),
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

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('ID')
                    ->sortable(),
                Tables\Columns\TextColumn::make('contribution.title')
                    ->label('Contribution')
                    ->limit(40)
                    ->searchable()
                    ->sortable(),
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
                Tables\Filters\SelectFilter::make('contribution_id')
                    ->relationship('contribution', 'title')
                    ->searchable()
                    ->preload(),
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
                            'status' => 'rejected',
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

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListContributionParticipants::route('/'),
            'view' => Pages\ViewContributionParticipant::route('/{record}'),
            'edit' => Pages\EditContributionParticipant::route('/{record}/edit'),
        ];
    }
}

