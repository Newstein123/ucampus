<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Tag extends Model
{
    protected $fillable = [
        'name',
    ];

    public function contributions()
    {
        return $this->belongsToMany(Contribution::class);
    }
}
