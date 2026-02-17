<?php

namespace App\Http\Controllers;

use App\Models\Contribution;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ShareController extends Controller
{
    /**
     * Handle shared content pages with Open Graph meta tags
     * Supports both slug (new) and ID (legacy) formats
     */
    public function show(Request $request, string $type, string $slugOrId)
    {
        // Validate type
        $validTypes = ['idea', 'project', 'question'];
        if (!in_array($type, $validTypes)) {
            return redirect('/');
        }

        // Fetch the contribution by slug or ID
        if (is_numeric($slugOrId)) {
            $contribution = Contribution::find($slugOrId);
        } else {
            $contribution = Contribution::where('slug', $slugOrId)->first();
        }
        
        if (!$contribution) {
            return redirect('/');
        }

        // Map type to internal type
        $typeMap = [
            'idea' => 'idea',
            'project' => 'project',
            'question' => 'question',
        ];

        // Verify the contribution type matches
        if ($contribution->type !== $typeMap[$type]) {
            return redirect('/');
        }

        // Get description based on type
        $description = '';
        if ($contribution->content) {
            $content = is_string($contribution->content) 
                ? json_decode($contribution->content, true) 
                : $contribution->content;
                
            if ($type === 'idea') {
                $description = $content['thought'] ?? $content['problem'] ?? '';
            } elseif ($type === 'project') {
                $description = $content['description'] ?? $content['problem'] ?? '';
            } elseif ($type === 'question') {
                $description = $content['thought'] ?? '';
            }
        }
        
        // Truncate description for OG tags (max 200 chars)
        $description = $this->truncateText($description, 200);

        // Get thumbnail URL
        $thumbnailUrl = $contribution->thumbnail_url;
        if ($thumbnailUrl && !str_starts_with($thumbnailUrl, 'http')) {
            $thumbnailUrl = url(Storage::url($thumbnailUrl));
        }
        if (!$thumbnailUrl) {
            $thumbnailUrl = url('/assets/images/idea-sample.png');
        }

        // Use slug for URLs (with ID fallback for contributions without slugs)
        $identifier = $contribution->slug ?? $contribution->id;

        // Canonical URL for the full detail page (use slug-based URL)
        $detailUrl = url("/{$type}s/{$identifier}");
        
        // Share URL (current page)
        $shareUrl = url("/share/{$type}/{$identifier}");

        // Prepare data for the view
        $data = [
            'title' => $contribution->title ?? 'U Campus',
            'description' => $description ?: 'Check out this amazing content on U Campus!',
            'image' => $thumbnailUrl,
            'url' => $shareUrl,
            'type' => $type,
            'slug' => $identifier,
            'id' => $contribution->id, // Keep ID for backward compatibility
            'detailUrl' => $detailUrl,
        ];

        // Always return the share view with OG tags
        // The view has JavaScript that redirects humans to the React app
        return view('share', $data);
    }

    /**
     * Check if the request is from a social media crawler
     */
    private function isSocialMediaCrawler(string $userAgent): bool
    {
        $crawlerPatterns = [
            'facebookexternalhit',
            'Facebot',
            'Twitterbot',
            'TelegramBot',
            'LinkedInBot',
            'WhatsApp',
            'Slackbot',
            'Discordbot',
            'Pinterest',
            'vkShare',
            'W3C_Validator',
            'baiduspider',
            'Googlebot',
        ];

        foreach ($crawlerPatterns as $pattern) {
            if (stripos($userAgent, $pattern) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Truncate text to a specified length
     */
    private function truncateText(string $text, int $length): string
    {
        $text = strip_tags($text);
        $text = trim($text);
        
        if (mb_strlen($text) <= $length) {
            return $text;
        }

        return mb_substr($text, 0, $length - 3) . '...';
    }
}
