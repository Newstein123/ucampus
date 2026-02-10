<?php

namespace App\Console\Commands;

use App\Models\Contribution;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class GenerateContributionSlugs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'contributions:generate-slugs {--force : Regenerate slugs even for contributions that already have one}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate slugs for all existing contributions';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $force = $this->option('force');
        
        $query = Contribution::withTrashed();
        
        if (!$force) {
            $query->whereNull('slug');
        }
        
        $contributions = $query->get();
        $count = $contributions->count();
        
        if ($count === 0) {
            $this->info('No contributions need slug generation.');
            return Command::SUCCESS;
        }
        
        $this->info("Generating slugs for {$count} contributions...");
        $bar = $this->output->createProgressBar($count);
        $bar->start();
        
        foreach ($contributions as $contribution) {
            $slug = $this->generateUniqueSlug($contribution);
            $contribution->slug = $slug;
            $contribution->saveQuietly(); // Save without triggering events
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();
        $this->info('Slugs generated successfully!');
        
        return Command::SUCCESS;
    }
    
    /**
     * Generate a unique slug for a contribution
     */
    private function generateUniqueSlug(Contribution $contribution): string
    {
        $title = $contribution->title ?? 'contribution-' . $contribution->id;
        $baseSlug = Str::slug($title);
        
        // If slug is empty (non-ASCII title), use ID-based slug
        if (empty($baseSlug)) {
            $baseSlug = 'contribution-' . $contribution->id;
        }
        
        $slug = $baseSlug;
        $counter = 1;
        
        // Check for uniqueness
        while (Contribution::withTrashed()
            ->where('slug', $slug)
            ->where('id', '!=', $contribution->id)
            ->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }
        
        return $slug;
    }
}
