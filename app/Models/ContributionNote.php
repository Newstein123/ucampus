<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContributionNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'contribution_id',
        'user_id',
        'type',
        'note',
    ];

    /**
     * Get the contribution that this note belongs to.
     */
    public function contribution(): BelongsTo
    {
        return $this->belongsTo(Contribution::class);
    }

    /**
     * Get the user who created this note.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
