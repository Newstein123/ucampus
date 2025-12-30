<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContributionParticipant extends Model
{
    use HasFactory;

    protected $fillable = [
        'contribution_id',
        'user_id',
        'role_id',
        'join_reason',
        'join_response',
        'status',
        'joined_at',
        'left_reason',
        'left_action',
        'left_at',
    ];

    protected $casts = [
        'joined_at' => 'datetime',
        'left_at' => 'datetime',
    ];

    public function contribution(): BelongsTo
    {
        return $this->belongsTo(Contribution::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(ContributionRole::class);
    }
}
