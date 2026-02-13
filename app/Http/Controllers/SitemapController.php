<?php

namespace App\Http\Controllers;

use App\Models\Contribution;
use Illuminate\Support\Facades\Response;

class SitemapController extends Controller
{
    /**
     * Generate XML sitemap for all public contributions
     */
    public function index()
    {
        $contributions = Contribution::where('is_public', true)
            ->whereNotNull('slug')
            ->orderBy('updated_at', 'desc')
            ->get();

        $baseUrl = config('app.url');

        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // Add homepage
        $xml .= '<url>';
        $xml .= '<loc>' . $baseUrl . '</loc>';
        $xml .= '<changefreq>daily</changefreq>';
        $xml .= '<priority>1.0</priority>';
        $xml .= '</url>';

        // Add contribution pages
        foreach ($contributions as $contribution) {
            $type = $contribution->type;
            $slug = $contribution->slug;
            
            // Map type to URL path
            $typePath = match($type) {
                'project' => 'projects',
                'idea' => 'ideas',
                'question' => 'questions',
                default => 'projects',
            };

            $url = "{$baseUrl}/{$typePath}/{$slug}";
            $lastmod = $contribution->updated_at->toIso8601String();
            
            // Priority based on type
            $priority = match($type) {
                'project' => '0.8',
                'idea' => '0.7',
                'question' => '0.6',
                default => '0.5',
            };

            $xml .= '<url>';
            $xml .= '<loc>' . htmlspecialchars($url) . '</loc>';
            $xml .= '<lastmod>' . $lastmod . '</lastmod>';
            $xml .= '<changefreq>weekly</changefreq>';
            $xml .= '<priority>' . $priority . '</priority>';
            $xml .= '</url>';
        }

        $xml .= '</urlset>';

        return Response::make($xml, 200, [
            'Content-Type' => 'application/xml',
        ]);
    }
}
