<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContributionEditRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'contribution_id',
        'user_id',
        'changes',
        'editor_note',
        'status',
        'reviewed_by',
        'review_note',
        'applied_at',
    ];

    protected $casts = [
        'changes' => 'array',
        'applied_at' => 'datetime',
    ];

    public function contribution(): BelongsTo
    {
        return $this->belongsTo(Contribution::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
