<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileService
{
    protected $disk;

    public function __construct()
    {
        $this->disk = config('filesystems.default') === 'minio' ? 'minio' : 'public';
    }

    /**
     * Upload a single file and return the relative path
     */
    public function uploadFile(UploadedFile $file, string $directory = 'contributions'): string
    {
        $filename = $this->generateUniqueFilename($file);
        $path = $directory . '/' . $filename;
        
        Storage::disk($this->disk)->putFileAs($directory, $file, $filename);
        
        return $path;
    }

    /**
     * Upload multiple files and return array of relative paths
     */
    public function uploadFiles(array $files, string $directory = 'contributions'): array
    {
        $uploadedFiles = [];
        
        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $uploadedFiles[] = $this->uploadFile($file, $directory);
            }
        }
        
        return $uploadedFiles;
    }

    /**
     * Get the full URL for a file path
     */
    public function getFileUrl(string $path): ?string
    {
        if (empty($path)) {
            return null;
        }

        if ($this->disk === 'minio') {
            return Storage::disk('minio')->url($path);
        }

        return Storage::disk('public')->url($path);
    }

    /**
     * Get full URLs for multiple file paths
     */
    public function getFileUrls(array $paths): array
    {
        $urls = [];
        
        foreach ($paths as $path) {
            $urls[] = $this->getFileUrl($path);
        }
        
        return array_filter($urls);
    }

    /**
     * Delete a file
     */
    public function deleteFile(string $path): bool
    {
        if (empty($path)) {
            return false;
        }

        return Storage::disk($this->disk)->delete($path);
    }

    /**
     * Delete multiple files
     */
    public function deleteFiles(array $paths): bool
    {
        $deleted = true;
        
        foreach ($paths as $path) {
            if (!$this->deleteFile($path)) {
                $deleted = false;
            }
        }
        
        return $deleted;
    }

    /**
     * Generate a unique filename
     */
    protected function generateUniqueFilename(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension();
        $filename = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        
        return $filename . '_' . time() . '_' . Str::random(8) . '.' . $extension;
    }

    /**
     * Check if file exists
     */
    public function fileExists(string $path): bool
    {
        if (empty($path)) {
            return false;
        }

        return Storage::disk($this->disk)->exists($path);
    }
}
