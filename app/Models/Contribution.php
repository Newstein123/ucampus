<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Contribution extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'title',
        'content',
        'type',
        'allow_collab',
        'is_public',
        'status',
        'views_count',
        'thumbnail_url',
        'likes_count'
    ];

    protected $casts = [
        'content' => 'array',
        'views_count' => 'integer',
        'likes_count' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class);
    }
}
