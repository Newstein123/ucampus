<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Contribution;
use App\Models\User;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get first user or create one if none exists
        $user = User::first();
        if (!$user) {
            $user = User::factory()->create();
        }

        // Project 1: Community Skill Exchange Platform
        Contribution::create([
            'user_id' => $user->id,
            'title' => 'Community Skill Exchange Platform',
            'type' => 'project',
            'allow_collab' => true,
            'is_public' => true,
            'is_sample' => true,
            'status' => 'active',
            'views_count' => 0,
            'likes_count' => 0,
            'thumbnail_url' => asset('assets/sample-projects/community-skill-platform.png'),
            'content' => json_encode([
                'description' => 'A public platform where individuals can exchange skills without money, such as teaching coding in exchange for language practice or design mentorship.',
                'problem' => 'Many people want to learn new skills but cannot afford courses or lack access to mentors. At the same time, others have valuable skills but no platform to share them in a structured way.',
                'solution' => 'Create a skill exchange system where users list skills they can offer and skills they want to learn, then match with others based on mutual interest.',
                'impact' => "Promotes peer-to-peer learning\nReduces education barriers\nBuilds stronger local communities",
                'resources' => "Web platform\nUser profiles\nMatching algorithm\nMessaging system",
                'references' => json_encode([
                    'https://www.timebanking.org',
                    'https://www.skillswap.org',
                ]),
            ]),
        ]);

        // Project 2: Local Farmer-to-Consumer Marketplace
        Contribution::create([
            'user_id' => $user->id,
            'title' => 'Local Farmer-to-Consumer Marketplace',
            'type' => 'project',
            'allow_collab' => true,
            'is_public' => true,
            'is_sample' => true,
            'status' => 'active',
            'views_count' => 0,
            'likes_count' => 0,
            'thumbnail_url' => asset('assets/sample-projects/local-farmer-to-consumer-market.png'),
            'content' => json_encode([
                'description' => 'An online marketplace that directly connects local farmers with consumers to sell fresh produce without intermediaries.',
                'problem' => 'Small farmers often rely on middlemen, reducing their profit, while consumers pay higher prices and lack transparency about food sources.',
                'solution' => 'Build a marketplace where farmers can list products, manage availability, and receive orders directly from nearby customers.',
                'impact' => "Increases farmer income\nLowers consumer prices\nEncourages sustainable agriculture",
                'resources' => "Product listing system\nLocation-based search\nOrder management\nPayment integration",
                'references' => json_encode([
                    'https://www.farmdrop.com',
                    'https://localharvest.org',
                ]),
            ]),
        ]);

        // Project 3: Student Mental Health Support Hub
        Contribution::create([
            'user_id' => $user->id,
            'title' => 'Student Mental Health Support Hub',
            'type' => 'project',
            'allow_collab' => true,
            'is_public' => true,
            'is_sample' => true,
            'status' => 'active',
            'views_count' => 0,
            'likes_count' => 0,
            'thumbnail_url' => asset('assets/sample-projects/student-mental-health-support.png'),
            'content' => json_encode([
                'description' => 'A digital hub providing anonymous mental health resources, peer support, and access to professional help for students.',
                'problem' => 'Students face academic pressure, isolation, and stress but hesitate to seek help due to stigma or lack of affordable services.',
                'solution' => 'Offer anonymous chat, curated resources, crisis guidance, and connections to certified counselors in one safe platform.',
                'impact' => "Improves student well-being\nEncourages early intervention\nReduces stigma around mental health",
                'resources' => "Anonymous user system\nContent moderation\nResource library\nReferral network",
                'references' => json_encode([
                    'https://www.opencounseling.com',
                    'https://www.nami.org',
                ]),
            ]),
        ]);

        // Project 4: Open Disaster Reporting System
        Contribution::create([
            'user_id' => $user->id,
            'title' => 'Open Disaster Reporting System',
            'type' => 'project',
            'allow_collab' => true,
            'is_public' => true,
            'is_sample' => true,
            'status' => 'active',
            'views_count' => 0,
            'likes_count' => 0,
            'thumbnail_url' => asset('assets/sample-projects/open-disaster-reporting-system.png'),
            'content' => json_encode([
                'description' => 'A crowdsourced reporting platform that allows citizens to report real-time disaster information such as floods, earthquakes, or fires.',
                'problem' => 'Official disaster information is often delayed or incomplete, making it difficult for communities to respond quickly.',
                'solution' => 'Enable users to submit verified reports with location data, photos, and descriptions, visible on a real-time map.',
                'impact' => "Faster emergency response\nImproved public awareness\nBetter coordination during disasters",
                'resources' => "Map integration\nReport verification workflow\nImage upload\nAlert system",
                'references' => json_encode([
                    'https://www.gdacs.org',
                    'https://www.openstreetmap.org',
                ]),
            ]),
        ]);

        // Project 5: Youth Career Exploration Platform
        Contribution::create([
            'user_id' => $user->id,
            'title' => 'Youth Career Exploration Platform',
            'type' => 'project',
            'allow_collab' => true,
            'is_public' => true,
            'is_sample' => true,
            'status' => 'active',
            'views_count' => 0,
            'likes_count' => 0,
            'thumbnail_url' => asset('assets/sample-projects/youth-career-exploration-platform.png'),
            'content' => json_encode([
                'description' => 'A platform that helps young people explore career paths through real-world stories, skill maps, and learning recommendations.',
                'problem' => 'Many youths choose careers without understanding job realities, leading to dissatisfaction and skill mismatch.',
                'solution' => 'Collect real career stories, required skills, salary ranges, and learning paths, presented in an interactive format.',
                'impact' => "Better career decisions\nReduced unemployment mismatch\nIncreased motivation for learning",
                'resources' => "Career database\nContent contribution system\nSkill mapping\nRecommendation engine",
                'references' => json_encode([
                    'https://www.onetonline.org',
                    'https://www.careerexplorer.com',
                ]),
            ]),
        ]);
    }
}
