<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Services\FileService;

class ContributionAttachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'contribution_id',
        'temp_key',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    /**
     * Get the contribution that owns the attachment
     */
    public function contribution()
    {
        return $this->belongsTo(Contribution::class);
    }

    /**
     * Get the full URL for the attachment
     */
    public function getUrlAttribute(): ?string
    {
        $fileService = app(FileService::class);
        return $fileService->getFileUrl($this->file_path);
    }
}
