<?php

namespace App\Filament\Resources;

use App\Filament\Resources\NotificationResource\Pages;
use App\Models\Notification;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class NotificationResource extends Resource
{
    protected static ?string $model = Notification::class;

    protected static ?string $navigationIcon = 'heroicon-o-bell';

    protected static ?string $navigationGroup = 'Users & Moderation';

    protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Select::make('recipient_user_id')
                    ->relationship('recipient', 'name')
                    ->label('Recipient')
                    ->required()
                    ->searchable()
                    ->preload()
                    ->disabled(),
                Forms\Components\Select::make('sender_user_id')
                    ->relationship('sender', 'name')
                    ->label('Sender')
                    ->searchable()
                    ->preload()
                    ->disabled(),
                Forms\Components\TextInput::make('type')
                    ->required()
                    ->maxLength(255)
                    ->disabled(),
                Forms\Components\TextInput::make('source_id')
                    ->label('Source ID')
                    ->numeric()
                    ->disabled(),
                Forms\Components\TextInput::make('source_type')
                    ->label('Source Type')
                    ->maxLength(255)
                    ->disabled(),
                Forms\Components\Textarea::make('message')
                    ->required()
                    ->rows(3)
                    ->columnSpanFull()
                    ->disabled(),
                Forms\Components\TextInput::make('redirect_url')
                    ->label('Redirect URL')
                    ->maxLength(255)
                    ->disabled(),
                Forms\Components\Toggle::make('is_read')
                    ->label('Read')
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
                Tables\Columns\TextColumn::make('recipient.name')
                    ->label('Recipient')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('sender.name')
                    ->label('Sender')
                    ->default('System')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'edit_request' => 'info',
                        'contributor_join' => 'success',
                        'contribution_update' => 'warning',
                        default => 'gray',
                    })
                    ->sortable(),
                Tables\Columns\TextColumn::make('message')
                    ->limit(50)
                    ->wrap(),
                Tables\Columns\IconColumn::make('is_read')
                    ->boolean()
                    ->label('Read')
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->options([
                        'edit_request' => 'Edit Request',
                        'contributor_join' => 'Contributor Join',
                        'contribution_update' => 'Contribution Update',
                    ]),
                Tables\Filters\TernaryFilter::make('is_read')
                    ->label('Read Status')
                    ->placeholder('All')
                    ->trueLabel('Read only')
                    ->falseLabel('Unread only'),
                Tables\Filters\SelectFilter::make('recipient_user_id')
                    ->relationship('recipient', 'name')
                    ->searchable()
                    ->preload(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
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
            'index' => Pages\ListNotifications::route('/'),
            'view' => Pages\ViewNotification::route('/{record}'),
        ];
    }
}

