<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ContributionEditRequestResource\Pages;
use App\Models\ContributionEditRequest;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;

class ContributionEditRequestResource extends Resource
{
    protected static ?string $model = ContributionEditRequest::class;

    protected static ?string $navigationIcon = 'heroicon-o-pencil-square';

    protected static ?string $navigationGroup = 'Contributions';

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationLabel = 'Edit Requests';

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
                Forms\Components\Textarea::make('editor_note')
                    ->label('Editor Note')
                    ->disabled(),
                Forms\Components\Section::make('Changes Comparison')
                    ->schema([
                        Forms\Components\View::make('filament.resources.contribution-edit-request-resource.changes-view')
                            ->viewData(fn ($record) => [
                                'changes' => $record->changes ?? [],
                            ]),
                    ])
                    ->columnSpanFull()
                    ->visible(fn ($record) => !empty($record?->changes)),
                Forms\Components\Textarea::make('changes_json')
                    ->label('Changes (JSON - Raw)')
                    ->formatStateUsing(fn ($record) => is_array($record->changes ?? null) ? json_encode($record->changes, JSON_PRETTY_PRINT) : '')
                    ->disabled()
                    ->rows(5)
                    ->columnSpanFull()
                    ->visible(fn ($record) => !empty($record->changes)),
                Forms\Components\Select::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'approved' => 'Approved',
                        'rejected' => 'Rejected',
                    ])
                    ->required()
                    ->disabled(fn ($record) => $record && $record->status !== 'pending'),
                Forms\Components\Textarea::make('review_note')
                    ->label('Review Note')
                    ->disabled(fn ($record) => $record && $record->status !== 'pending'),
                Forms\Components\Select::make('reviewed_by')
                    ->relationship('reviewer', 'name')
                    ->searchable()
                    ->preload()
                    ->disabled(),
                Forms\Components\DateTimePicker::make('applied_at')
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
                    ->label('Requested By')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'approved' => 'success',
                        'rejected' => 'danger',
                        default => 'gray',
                    })
                    ->sortable(),
                Tables\Columns\TextColumn::make('reviewer.name')
                    ->label('Reviewed By')
                    ->default('—')
                    ->sortable(),
                Tables\Columns\TextColumn::make('applied_at')
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
                        'approved' => 'Approved',
                        'rejected' => 'Rejected',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\Action::make('approve')
                    ->label('Approve')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->form([
                        Forms\Components\Textarea::make('review_note')
                            ->label('Review Note (Optional)'),
                    ])
                    ->action(function (ContributionEditRequest $record, array $data) {
                        $record->update([
                            'status' => 'approved',
                            'reviewed_by' => Auth::id(),
                            'review_note' => $data['review_note'] ?? null,
                            'applied_at' => now(),
                        ]);
                    })
                    ->visible(fn (ContributionEditRequest $record) => $record->status === 'pending'),
                Tables\Actions\Action::make('reject')
                    ->label('Reject')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->form([
                        Forms\Components\Textarea::make('review_note')
                            ->label('Review Note')
                            ->required(),
                    ])
                    ->action(function (ContributionEditRequest $record, array $data) {
                        $record->update([
                            'status' => 'rejected',
                            'reviewed_by' => Auth::id(),
                            'review_note' => $data['review_note'],
                        ]);
                    })
                    ->visible(fn (ContributionEditRequest $record) => $record->status === 'pending'),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    //
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
            'index' => Pages\ListContributionEditRequests::route('/'),
            'view' => Pages\ViewContributionEditRequest::route('/{record}'),
        ];
    }
}

