<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Discussion extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'contribution_id',
        'user_id',
        'parent_id',
        'is_edited',
        'content',
        'upvotes',
        'downvotes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function contribution()
    {
        return $this->belongsTo(Contribution::class);
    }

    public function parent()
    {
        return $this->belongsTo(Discussion::class, 'parent_id');
    }

    public function replies()
    {
        return $this->hasMany(Discussion::class, 'parent_id')->with(['user', 'replies']);
    }

    public function isTopLevel(): bool
    {
        return $this->parent_id === null;
    }

    /**
     * Users who expressed interest (liked) this discussion
     */
    public function interests()
    {
        return $this->belongsToMany(User::class, 'discussion_interest', 'discussion_id', 'user_id')
            ->withTimestamps();
    }

    /**
     * Get the count of interests
     */
    public function getInterestsCountAttribute()
    {
        return $this->interests()->count();
    }
}
