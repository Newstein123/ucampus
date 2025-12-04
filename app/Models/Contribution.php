<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contribution extends Model
{
    use HasFactory, SoftDeletes;

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
        'attachments',
        'likes_count'
    ];

    protected $casts = [
        'content' => 'array',
        'attachments' => 'array',
        'views_count' => 'integer',
        'likes_count' => 'integer',
        'allow_collab' => 'boolean',
        'is_public' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class);
    }

    public function participants(): HasMany
    {
        return $this->hasMany(ContributionParticipant::class);
    }

    public function interests()
    {
        return $this->belongsToMany(User::class, 'contribution_interest', 'contribution_id', 'user_id');
    }

    public function getInterestsCountAttribute()
    {
        return $this->interests->count();
    }

    public function bookmarkedBy()
    {
        return $this->belongsToMany(User::class, 'contribution_bookmarks', 'contribution_id', 'user_id')
            ->withTimestamps();
    }
}
