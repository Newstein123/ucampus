<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileService
{
    protected string $disk;

    public function __construct()
    {
        $defaultDisk = config('filesystems.default');
        $this->disk = $defaultDisk === 's3' ? 's3' : 'public';
    }

    /**
     * Upload a single file and return the relative path
     */
    public function uploadFile(UploadedFile $file, string $directory = 'contributions'): string
    {
        $filename = $this->generateUniqueFilename($file);
        $path = $directory . '/' . $filename;

        try {
            if ($this->disk === 's3') {
                $this->uploadToS3($file, $path);
            } else {
                $path = $this->uploadToLocal($file, $directory, $filename);
            }

            // Verify file exists after upload
            if (!Storage::disk($this->disk)->exists($path)) {
                throw new \Exception("File was not found after upload: {$path}");
            }

            return $path;
        } catch (\Exception $e) {
            $this->logUploadError($e, $file, $path, $directory, $filename);
            throw new \Exception("Failed to upload file: " . $e->getMessage(), 0, $e);
        }
    }

    /**
     * Upload file to S3-compatible storage
     */
    protected function uploadToS3(UploadedFile $file, string $path): void
    {
        $storage = Storage::disk($this->disk);
        $fileContents = file_get_contents($file->getRealPath());

        if ($fileContents === false) {
            throw new \Exception("Failed to read file contents from: " . $file->getRealPath());
        }

        // Try uploading with options first
        $stored = $this->attemptS3Upload($storage, $path, $fileContents, $file->getMimeType());

        if (!$stored) {
            throw new \Exception($this->buildS3ErrorMessage($path));
        }
    }

    /**
     * Attempt to upload to S3 with fallback strategies
     */
    protected function attemptS3Upload($storage, string $path, string $fileContents, string $mimeType): bool
    {
        try {
            // Try with visibility and content type
            $result = $storage->put($path, $fileContents, [
                'visibility' => 'public',
                'ContentType' => $mimeType,
            ]);

            if ($result) {
                return true;
            }

            Log::warning("S3 put() returned false with options for path: {$path}");
        } catch (\Exception $e) {
            Log::warning("S3 upload with options failed: " . $e->getMessage(), [
                'path' => $path,
                'mime_type' => $mimeType,
                'file_size' => strlen($fileContents),
            ]);
        }

        // Fallback: upload without options, then set visibility
        try {
            $stored = $storage->put($path, $fileContents);

            if ($stored) {
                try {
                    $storage->setVisibility($path, 'public');
                } catch (\Exception $visException) {
                    Log::warning("Failed to set visibility: " . $visException->getMessage(), [
                        'path' => $path,
                    ]);
                }
            } else {
                Log::error("S3 put() returned false without options for path: {$path}");
            }

            return $stored;
        } catch (\Exception $e) {
            Log::error("S3 upload fallback also failed: " . $e->getMessage(), [
                'path' => $path,
                'file_size' => strlen($fileContents),
            ]);
            return false;
        }
    }

    /**
     * Build detailed S3 error message
     */
    protected function buildS3ErrorMessage(string $path): string
    {
        $diskConfig = $this->getDiskConfig();
        $errorMsg = "put() returned false for path: {$path}\n";
        $errorMsg .= "Disk: {$this->disk}\n";
        $errorMsg .= "Bucket: " . ($diskConfig['bucket'] ?? 'unknown') . "\n";
        $errorMsg .= "Endpoint: " . ($diskConfig['endpoint'] ?? 'unknown') . "\n";
        $errorMsg .= "Key: " . ($diskConfig['key'] ?? 'unknown') . "\n";
        $errorMsg .= "Region: " . ($diskConfig['region'] ?? 'unknown') . "\n";
        $errorMsg .= "Possible causes:\n";
        $errorMsg .= "1. Bucket doesn't exist\n";
        $errorMsg .= "2. Wrong credentials\n";
        $errorMsg .= "3. Endpoint URL is incorrect\n";
        $errorMsg .= "4. Network connectivity issue";

        return $errorMsg;
    }

    /**
     * Upload file to local storage
     */
    protected function uploadToLocal(UploadedFile $file, string $directory, string $filename): string
    {
        $storedPath = Storage::disk($this->disk)->putFileAs($directory, $file, $filename);

        if ($storedPath === false || empty($storedPath)) {
            throw new \Exception("putFileAs returned false/empty for path: {$directory}/{$filename}");
        }

        return $storedPath;
    }

    /**
     * Log upload error with context
     */
    protected function logUploadError(\Exception $e, UploadedFile $file, string $path, string $directory, string $filename): void
    {
        Log::error("File upload failed: " . $e->getMessage(), [
            'disk' => $this->disk,
            'path' => $path,
            'directory' => $directory,
            'filename' => $filename,
            'file_size' => $file->getSize(),
            'file_mime' => $file->getMimeType(),
            'exception' => get_class($e),
            'trace' => $e->getTraceAsString(),
        ]);
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

        if ($this->disk === 's3') {
            return $this->getS3FileUrl($path);
        }

        return Storage::disk('public')->url($path);
    }

    /**
     * Get S3-compatible file URL
     */
    protected function getS3FileUrl(string $path): ?string
    {
        try {
            $diskConfig = $this->getDiskConfig();
            $url = $diskConfig['url'] ?? null;

            // Use explicit URL if set (set AWS_URL in .env for public URLs)
            if ($url) {
                return $this->buildUrl($url, $path);
            }

            return Storage::disk($this->disk)->url($path);
        } catch (\Exception $e) {
            Log::warning("Failed to generate file URL: " . $e->getMessage(), [
                'path' => $path,
                'disk' => $this->disk,
            ]);

            return $this->getTemporaryUrl($path);
        }
    }

    /**
     * Build URL from base URL and path
     */
    protected function buildUrl(string $baseUrl, string $path): string
    {
        $cleanPath = ltrim($path, '/');
        return rtrim($baseUrl, '/') . '/' . $cleanPath;
    }

    /**
     * Get temporary URL as fallback
     */
    protected function getTemporaryUrl(string $path): ?string
    {
        try {
            return Storage::disk($this->disk)->temporaryUrl($path, now()->addHours(24));
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get disk configuration
     */
    protected function getDiskConfig(): array
    {
        return config("filesystems.disks.{$this->disk}", []);
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

        try {
            $storage = Storage::disk($this->disk);

            if (!$storage->exists($path)) {
                Log::warning("File does not exist, cannot delete: {$path}");
                return false;
            }

            $deleted = $storage->delete($path);

            // Verify deletion
            if ($deleted && $storage->exists($path)) {
                Log::warning("File still exists after delete attempt: {$path}");
                return false;
            }

            return $deleted;
        } catch (\Exception $e) {
            Log::error("File deletion failed: " . $e->getMessage(), [
                'disk' => $this->disk,
                'path' => $path,
            ]);
            return false;
        }
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

    /**
     * Check if using S3-compatible storage (AWS S3 or MinIO)
     */
    public function isS3Compatible(): bool
    {
        return $this->disk === 's3';
    }

    /**
     * Get the current disk name
     */
    public function getDisk(): string
    {
        return $this->disk;
    }

    /**
     * Set visibility for a file (public or private)
     */
    public function setVisibility(string $path, string $visibility = 'public'): bool
    {
        if (empty($path)) {
            return false;
        }

        try {
            Storage::disk($this->disk)->setVisibility($path, $visibility);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Make existing files public (useful for fixing visibility issues)
     */
    public function makePublic(string $path): bool
    {
        return $this->setVisibility($path, 'public');
    }

    /**
     * Make existing files private
     */
    public function makePrivate(string $path): bool
    {
        return $this->setVisibility($path, 'private');
    }

    /**
     * Test the storage connection
     */
    public function testConnection(): array
    {
        $results = [
            'disk' => $this->disk,
            'connected' => false,
            'writable' => false,
            'readable' => false,
            'error' => null,
        ];

        try {
            // Test write
            $testPath = 'test_' . time() . '.txt';
            $written = Storage::disk($this->disk)->put($testPath, 'test content');

            if ($written) {
                $results['writable'] = true;

                // Test read
                if (Storage::disk($this->disk)->exists($testPath)) {
                    $results['readable'] = true;
                    $content = Storage::disk($this->disk)->get($testPath);
                    if ($content === 'test content') {
                        $results['connected'] = true;
                    }

                    // Clean up test file
                    Storage::disk($this->disk)->delete($testPath);
                }
            }
        } catch (\Exception $e) {
            $results['error'] = $e->getMessage();
        }

        return $results;
    }
}
