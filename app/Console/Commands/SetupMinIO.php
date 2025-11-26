<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class SetupMinIO extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'minio:setup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Setup MinIO bucket for file storage';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            $this->info('Setting up MinIO bucket...');
            
            // Create bucket if it doesn't exist
            $bucket = config('filesystems.disks.minio.bucket', 'contributions');
            
            if (!Storage::disk('minio')->exists('')) {
                Storage::disk('minio')->makeDirectory('');
                $this->info("Created bucket: {$bucket}");
            } else {
                $this->info("Bucket already exists: {$bucket}");
            }
            
            // Create directories
            $directories = ['contributions/thumbnails', 'contributions/attachments'];
            
            foreach ($directories as $directory) {
                if (!Storage::disk('minio')->exists($directory)) {
                    Storage::disk('minio')->makeDirectory($directory);
                    $this->info("Created directory: {$directory}");
                } else {
                    $this->info("Directory already exists: {$directory}");
                }
            }
            
            $this->info('MinIO setup completed successfully!');
            
        } catch (\Exception $e) {
            $this->error('Failed to setup MinIO: ' . $e->getMessage());
            return 1;
        }
        
        return 0;
    }
}
