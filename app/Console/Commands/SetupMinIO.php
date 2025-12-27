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
            $bucket = config('filesystems.disks.s3.bucket', 'contributions');

            if (!Storage::disk('s3')->exists('')) {
                Storage::disk('s3')->makeDirectory('');
                $this->info("Created bucket: {$bucket}");
            } else {
                $this->info("Bucket already exists: {$bucket}");
            }

            // Create directories
            $directories = ['contributions/thumbnails', 'contributions/attachments'];

            foreach ($directories as $directory) {
                if (!Storage::disk('s3')->exists($directory)) {
                    Storage::disk('s3')->makeDirectory($directory);
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
