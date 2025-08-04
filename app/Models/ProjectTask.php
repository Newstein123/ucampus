<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'contribution_id',
        'title',
        'description',
        'due_date',
        'status'
    ];

    protected $casts = [
        'due_date' => 'date'
    ];

    public function contribution(): BelongsTo
    {
        return $this->belongsTo(Contribution::class);
    }
} 