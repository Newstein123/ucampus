<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContributionRole extends Model
{
    protected $fillable = [
        'key',
        'label',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
