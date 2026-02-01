<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Tag;
use App\Models\Contribution;
use App\Services\FileService;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get the first user or create a default one for sample contributions
        $user = User::find(3);
        \Log::info('User: ' . $user);
        if (!$user) {
            \Log::info('No user found');
            // If no users exist, we'll skip seeding or use a default ID
            // In production, users should already be seeded
            return;
        }

        // Initialize FileService for uploading images to MinIO
        $fileService = app(FileService::class);

        $jsonPath = storage_path('app/public/json');

        // Load all contributions from JSON files
        $allContributions = [];

        // Load Ideas
        $ideas = $this->loadIdeas($jsonPath . '/idea.json');
        foreach ($ideas as $idea) {
            $allContributions[] = [
                'type' => 'idea',
                'data' => $idea,
            ];
        }

        // Load Projects
        $projects = $this->loadProjects($jsonPath . '/project.json');
        foreach ($projects as $project) {
            $allContributions[] = [
                'type' => 'project',
                'data' => $project,
            ];
        }

        // Load Questions
        $questions = $this->loadQuestions($jsonPath . '/question.json');
        foreach ($questions as $question) {
            $allContributions[] = [
                'type' => 'question',
                'data' => $question,
            ];
        }

        // Shuffle the array to randomize the order
        shuffle($allContributions);

        // Seed all contributions in random order
        foreach ($allContributions as $contribution) {
            switch ($contribution['type']) {
                case 'idea':
                    $this->createIdea($contribution['data'], $user, $fileService);
                    break;
                case 'project':
                    $this->createProject($contribution['data'], $user, $fileService);
                    break;
                case 'question':
                    $this->createQuestion($contribution['data'], $user);
                    break;
            }
        }
    }

    /**
     * Load ideas from JSON file
     */
    private function loadIdeas(string $filePath): array
    {
        if (!File::exists($filePath)) {
            return [];
        }

        $jsonContent = File::get($filePath);
        $ideas = json_decode($jsonContent, true);

        if (json_last_error() !== JSON_ERROR_NONE || !is_array($ideas)) {
            return [];
        }

        $validIdeas = [];
        foreach ($ideas as $idea) {
            if (isset($idea['type']) && $idea['type'] === 'idea' && isset($idea['title'])) {
                $validIdeas[] = $idea;
            }
        }

        return $validIdeas;
    }

    /**
     * Create a single idea contribution
     */
    private function createIdea(array $idea, User $user, FileService $fileService): void
    {
        // Transform idea content structure
        $content = [
            'title' => $idea['title'],
            'description' => '',
            'problem' => $idea['content']['problem'] ?? '',
            'thought' => $idea['content']['thought'] ?? '',
            'why_it_matters' => $idea['content']['why_it_matters'] ?? '',
            'solution' => '',
            'impact' => '',
            'resources' => '',
            'references' => '',
            'question' => '',
            'answer' => '',
        ];

        // Generate and upload thumbnail from Unsplash to MinIO
        $thumbnailUrl = $this->downloadAndUploadThumbnail($idea['title'], 'idea', $fileService);

        Contribution::create([
            'user_id' => $user->id,
            'title' => $idea['title'],
            'type' => 'idea',
            'content' => $content,
            'allow_collab' => true,
            'is_public' => true,
            'is_sample' => true,
            'status' => 'active',
            'views_count' => 0,
            'likes_count' => 0,
            'thumbnail_url' => $thumbnailUrl,
        ]);
    }

    /**
     * Load projects from JSON file
     */
    private function loadProjects(string $filePath): array
    {
        if (!File::exists($filePath)) {
            return [];
        }

        $jsonContent = File::get($filePath);
        $projects = json_decode($jsonContent, true);

        if (json_last_error() !== JSON_ERROR_NONE || !is_array($projects)) {
            return [];
        }

        $validProjects = [];
        foreach ($projects as $project) {
            if (isset($project['type']) && $project['type'] === 'project' && isset($project['title'])) {
                $validProjects[] = $project;
            }
        }

        return $validProjects;
    }

    /**
     * Create a single project contribution
     */
    private function createProject(array $project, User $user, FileService $fileService): void
    {
        // Transform project content structure
        $impact = is_array($project['impact'] ?? null)
            ? implode("\n", $project['impact'])
            : ($project['impact'] ?? '');

        $resources = is_array($project['resources'] ?? null)
            ? implode("\n", $project['resources'])
            : ($project['resources'] ?? '');

        $references = is_array($project['references'] ?? null)
            ? json_encode($project['references'])
            : ($project['references'] ?? '');

        $content = [
            'title' => $project['title'],
            'description' => $project['description'] ?? '',
            'problem' => $project['problem'] ?? '',
            'solution' => $project['solution'] ?? '',
            'impact' => $impact,
            'resources' => $resources,
            'references' => $references,
            'thought' => '',
            'why_it_matters' => '',
            'question' => '',
            'answer' => '',
        ];

        // Generate and upload thumbnail from Unsplash to MinIO
        $searchTerm = $project['category'] ?? $project['title'];
        $thumbnailUrl = $this->downloadAndUploadThumbnail($searchTerm, 'project', $fileService);

        $contribution = Contribution::create([
            'user_id' => $user->id,
            'title' => $project['title'],
            'type' => 'project',
            'content' => $content,
            'allow_collab' => true,
            'is_public' => true,
            'is_sample' => true,
            'status' => 'active',
            'views_count' => 0,
            'likes_count' => 0,
            'thumbnail_url' => $thumbnailUrl,
        ]);

        // Attach tag based on category if it exists
        if (isset($project['category']) && $project['category']) {
            $tag = Tag::where('name', $project['category'])->first();
            if ($tag) {
                $contribution->tags()->attach($tag->id);
            }
        }
    }

    /**
     * Load questions from JSON file
     */
    private function loadQuestions(string $filePath): array
    {
        if (!File::exists($filePath)) {
            return [];
        }

        $jsonContent = File::get($filePath);
        $questions = json_decode($jsonContent, true);

        if (json_last_error() !== JSON_ERROR_NONE || !is_array($questions)) {
            return [];
        }

        $validQuestions = [];
        foreach ($questions as $question) {
            if (isset($question['type']) && $question['type'] === 'question' && isset($question['title'])) {
                $validQuestions[] = $question;
            }
        }

        return $validQuestions;
    }

    /**
     * Create a single question contribution
     */
    private function createQuestion(array $question, User $user): void
    {
        // Transform question content structure
        $content = [
            'title' => $question['title'],
            'question' => $question['title'],
            'thought' => $question['content']['thought'] ?? '',
            'answer' => null,
            'description' => '',
            'problem' => '',
            'solution' => '',
            'impact' => '',
            'resources' => '',
            'references' => '',
            'why_it_matters' => '',
        ];

        Contribution::create([
            'user_id' => $user->id,
            'title' => $question['title'],
            'type' => 'question',
            'content' => $content,
            'allow_collab' => true,
            'is_public' => true,
            'is_sample' => true,
            'status' => 'active',
            'views_count' => 0,
            'likes_count' => 0,
        ]);
    }

    /**
     * Download thumbnail from Unsplash and upload to MinIO
     * Returns the MinIO URL or null if download/upload fails
     */
    private function downloadAndUploadThumbnail(string $searchTerm, string $type, FileService $fileService): ?string
    {
        try {
            // Generate Unsplash URL
            $unsplashUrl = $this->generateUnsplashUrl($searchTerm, $type);

            if (!$unsplashUrl) {
                return null;
            }

            // Download image from Unsplash
            $imageContent = $this->downloadImage($unsplashUrl);

            if (!$imageContent) {
                Log::warning("Failed to download image from Unsplash", [
                    'url' => $unsplashUrl,
                    'search_term' => $searchTerm,
                ]);
                return null;
            }

            // Validate it's an image
            $imageInfo = @getimagesizefromstring($imageContent);
            if ($imageInfo === false) {
                Log::warning("Downloaded content is not a valid image", [
                    'url' => $unsplashUrl,
                ]);
                return null;
            }

            // Determine file extension from MIME type
            $mimeType = $imageInfo['mime'];
            $extension = $this->getExtensionFromMimeType($mimeType);

            if (!$extension) {
                $extension = 'jpg'; // Default to jpg
            }

            // Generate unique filename
            $filename = 'thumbnail_' . time() . '_' . Str::random(8) . '.' . $extension;
            $directory = 'contributions/thumbnails';
            $path = $directory . '/' . $filename;

            // Get storage disk
            $disk = $fileService->getDisk();
            $storage = Storage::disk($disk);

            // Upload to MinIO/S3
            if ($disk === 's3') {
                // Upload to S3-compatible storage (MinIO)
                $uploaded = $storage->put($path, $imageContent, [
                    'visibility' => 'public',
                    'ContentType' => $mimeType,
                ]);
            } else {
                // Upload to local storage
                $uploaded = $storage->put($path, $imageContent);
                if ($uploaded) {
                    $storage->setVisibility($path, 'public');
                }
            }

            if (!$uploaded) {
                Log::warning("Failed to upload image to storage", [
                    'path' => $path,
                    'disk' => $disk,
                ]);
                return null;
            }

            // Return just the relative path, not the full URL
            // The frontend will handle adding the base URL
            return $path;
        } catch (\Exception $e) {
            Log::error("Error downloading/uploading thumbnail: " . $e->getMessage(), [
                'search_term' => $searchTerm,
                'type' => $type,
                'trace' => $e->getTraceAsString(),
            ]);
            return null;
        }
    }

    /**
     * Generate Unsplash URL based on topic/title
     */
    private function generateUnsplashUrl(string $searchTerm, string $type): ?string
    {
        // Extract keywords from the title
        $keywords = strtolower($this->extractKeywords($searchTerm, $type));

        // Map keywords to image categories/themes for better relevance
        $imageThemes = $this->mapKeywordsToImageTheme($keywords, $type);

        // Create a seed from keywords for consistent image selection per topic
        $seed = abs(crc32(strtolower($keywords . $imageThemes)));

        $width = 800;
        $height = 600;

        // Use Picsum Photos with seed - provides high-quality images
        // that are consistent for the same seed value
        return "https://picsum.photos/seed/{$seed}/{$width}/{$height}";
    }

    /**
     * Download image from URL
     */
    private function downloadImage(string $url): ?string
    {
        try {
            // Use file_get_contents with context for better error handling
            $context = stream_context_create([
                'http' => [
                    'timeout' => 10,
                    'user_agent' => 'Mozilla/5.0 (compatible; Laravel Migration)',
                    'follow_location' => true,
                    'max_redirects' => 3,
                ],
            ]);

            $imageContent = @file_get_contents($url, false, $context);

            if ($imageContent === false) {
                return null;
            }

            return $imageContent;
        } catch (\Exception $e) {
            Log::warning("Error downloading image: " . $e->getMessage(), [
                'url' => $url,
            ]);
            return null;
        }
    }

    /**
     * Get file extension from MIME type
     */
    private function getExtensionFromMimeType(string $mimeType): ?string
    {
        $mimeToExtension = [
            'image/jpeg' => 'jpg',
            'image/jpg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
            'image/svg+xml' => 'svg',
        ];

        return $mimeToExtension[$mimeType] ?? null;
    }

    /**
     * Map keywords to image themes for better visual relevance
     */
    private function mapKeywordsToImageTheme(string $keywords, string $type): string
    {
        // Define keyword mappings to image themes
        $themeMap = [
            // Technology themes
            'ai' => 'technology',
            'artificial intelligence' => 'technology',
            'machine learning' => 'technology',
            'software' => 'technology',
            'app' => 'technology',
            'platform' => 'technology',
            'digital' => 'technology',
            'code' => 'technology',
            'programming' => 'technology',

            // Science themes
            'astronomy' => 'science',
            'space' => 'science',
            'physics' => 'science',
            'quantum' => 'science',
            'research' => 'science',
            'experiment' => 'science',

            // Education themes
            'education' => 'education',
            'learning' => 'education',
            'student' => 'education',
            'school' => 'education',
            'tutor' => 'education',
            'study' => 'education',

            // Business/Social themes
            'community' => 'community',
            'social' => 'community',
            'marketplace' => 'business',
            'business' => 'business',
            'finance' => 'business',
            'health' => 'health',
            'wellness' => 'health',
        ];

        // Check if any theme keywords match
        foreach ($themeMap as $keyword => $theme) {
            if (strpos($keywords, $keyword) !== false) {
                return $theme;
            }
        }

        // Default themes by type
        $defaultThemes = [
            'idea' => 'innovation',
            'project' => 'development',
            'question' => 'discussion',
        ];

        return $defaultThemes[$type] ?? 'general';
    }

    /**
     * Extract relevant keywords from title for image search
     */
    private function extractKeywords(string $title, string $type): string
    {
        // Convert to lowercase and remove special characters
        $title = strtolower($title);

        // Remove common words
        $stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now'];

        // Split into words
        $words = preg_split('/\s+/', $title);

        // Filter out stop words and short words
        $keywords = array_filter($words, function ($word) use ($stopWords) {
            $word = trim($word, '.,!?;:()[]{}"\'-');
            return strlen($word) > 2 && !in_array($word, $stopWords);
        });

        // Take first 2-3 relevant keywords
        $keywords = array_slice($keywords, 0, 3);

        // If no keywords found, use type-specific defaults
        if (empty($keywords)) {
            $defaults = [
                'idea' => 'innovation technology',
                'project' => 'project development',
                'question' => 'question discussion',
            ];
            return $defaults[$type] ?? 'technology';
        }

        return implode(' ', $keywords);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Delete all sample contributions
        Contribution::where('is_sample', true)->delete();
    }
};
