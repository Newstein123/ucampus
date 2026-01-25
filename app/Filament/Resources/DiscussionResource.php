<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DiscussionResource\Pages;
use App\Models\Discussion;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class DiscussionResource extends Resource
{
    protected static ?string $model = Discussion::class;

    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-right';

    protected static ?string $navigationGroup = 'Users & Moderation';

    protected static ?int $navigationSort = 2;

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
                Forms\Components\Select::make('parent_id')
                    ->relationship('parent', 'id')
                    ->label('Parent Discussion')
                    ->searchable()
                    ->preload()
                    ->disabled(),
                Forms\Components\Textarea::make('content')
                    ->required()
                    ->rows(5)
                    ->columnSpanFull(),
                Forms\Components\Toggle::make('is_edited')
                    ->disabled(),
                Forms\Components\Toggle::make('is_locked')
                    ->label('Locked')
                    ->helperText('Locked discussions prevent new replies'),
                Forms\Components\TextInput::make('upvotes')
                    ->numeric()
                    ->default(0)
                    ->disabled(),
                Forms\Components\TextInput::make('downvotes')
                    ->numeric()
                    ->default(0)
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
                Tables\Columns\TextColumn::make('content')
                    ->limit(50)
                    ->searchable()
                    ->wrap(),
                Tables\Columns\TextColumn::make('parent_id')
                    ->label('Reply To')
                    ->default('—')
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_edited')
                    ->boolean()
                    ->label('Edited')
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_locked')
                    ->boolean()
                    ->label('Locked')
                    ->sortable(),
                Tables\Columns\TextColumn::make('upvotes')
                    ->sortable(),
                Tables\Columns\TextColumn::make('downvotes')
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
                Tables\Columns\TextColumn::make('deleted_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('contribution_id')
                    ->relationship('contribution', 'title')
                    ->searchable()
                    ->preload(),
                Tables\Filters\TernaryFilter::make('is_locked')
                    ->label('Locked')
                    ->placeholder('All')
                    ->trueLabel('Locked only')
                    ->falseLabel('Unlocked only'),
                Tables\Filters\TrashedFilter::make(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('lock')
                    ->label('Lock')
                    ->icon('heroicon-o-lock-closed')
                    ->color('warning')
                    ->requiresConfirmation()
                    ->action(function (Discussion $record) {
                        $record->update(['is_locked' => true]);
                    })
                    ->visible(fn (Discussion $record) => !$record->is_locked),
                Tables\Actions\Action::make('unlock')
                    ->label('Unlock')
                    ->icon('heroicon-o-lock-open')
                    ->color('success')
                    ->requiresConfirmation()
                    ->action(function (Discussion $record) {
                        $record->update(['is_locked' => false]);
                    })
                    ->visible(fn (Discussion $record) => $record->is_locked),
                Tables\Actions\DeleteAction::make(),
                Tables\Actions\RestoreAction::make(),
                Tables\Actions\ForceDeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\RestoreBulkAction::make(),
                    Tables\Actions\ForceDeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->withoutGlobalScopes([
                SoftDeletingScope::class,
            ]);
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
            'index' => Pages\ListDiscussions::route('/'),
            'view' => Pages\ViewDiscussion::route('/{record}'),
            'edit' => Pages\EditDiscussion::route('/{record}/edit'),
        ];
    }
}

