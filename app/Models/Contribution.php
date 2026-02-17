<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Contribution extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'slug',
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

    /**
     * Boot method to auto-generate slug from title
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($contribution) {
            // Only generate slug if the column exists (defensive for migrations)
            if (\Schema::hasColumn('contributions', 'slug')) {
                if (empty($contribution->slug) && !empty($contribution->title)) {
                    $contribution->slug = static::generateUniqueSlug($contribution->title);
                }
            }
        });

        static::updating(function ($contribution) {
            // Only regenerate slug if title changed, slug wasn't manually set, and column exists
            if (\Schema::hasColumn('contributions', 'slug')) {
                if ($contribution->isDirty('title') && !$contribution->isDirty('slug') && !empty($contribution->title)) {
                    $contribution->slug = static::generateUniqueSlug($contribution->title, $contribution->id);
                }
            }
        });
    }

    /**
     * Generate a unique slug from a title
     */
    public static function generateUniqueSlug(string $title, ?int $excludeId = null): string
    {
        $baseSlug = Str::slug($title);
        
        // If slug is empty (non-ASCII title), use a random string
        if (empty($baseSlug)) {
            $baseSlug = 'contribution-' . Str::random(8);
        }
        
        $slug = $baseSlug;
        $counter = 1;
        
        // Build query to check uniqueness
        $query = static::withTrashed()->where('slug', $slug);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        
        while ($query->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
            
            $query = static::withTrashed()->where('slug', $slug);
            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }
        }
        
        return $slug;
    }

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

    /**
     * Get the attachments for the contribution
     */
    public function contributionAttachments()
    {
        return $this->hasMany(ContributionAttachment::class);
    }

    /**
     * Get all discussions (comments) for this contribution
     */
    public function discussions()
    {
        return $this->hasMany(Discussion::class);
    }

    /**
     * Get all edit requests for this contribution
     */
    public function editRequests()
    {
        return $this->hasMany(ContributionEditRequest::class);
    }

    /**
     * Get all notes for this contribution
     */
    public function notes()
    {
        return $this->hasMany(ContributionNote::class);
    }
}
