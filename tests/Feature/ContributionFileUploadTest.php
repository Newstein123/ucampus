<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Contribution;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ContributionFileUploadTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Mock storage for testing
        Storage::fake('minio');
    }

    public function test_can_create_contribution_with_thumbnail()
    {
        $user = User::factory()->create();
        
        $thumbnail = UploadedFile::fake()->image('thumbnail.jpg', 800, 600);
        
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/contributions', [
                'title' => 'Test Contribution with Thumbnail',
                'content' => ['blocks' => [['type' => 'paragraph', 'data' => ['text' => 'Test content']]]],
                'type' => 'idea',
                'allow_collab' => true,
                'is_public' => true,
                'thumbnail_url' => $thumbnail,
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'title',
                    'content',
                    'type',
                    'thumbnail_url',
                    'attachments',
                    'user'
                ]
            ]);

        // Verify file was stored
        $contribution = Contribution::first();
        $this->assertNotNull($contribution->thumbnail_url);
        $this->assertStringContains('contributions/thumbnails', $contribution->thumbnail_url);
        
        // Verify thumbnail URL is returned
        $this->assertNotNull($response->json('data.thumbnail_url'));
    }

    public function test_can_create_contribution_with_attachments()
    {
        $user = User::factory()->create();
        
        $attachments = [
            UploadedFile::fake()->create('document.pdf', 1024),
            UploadedFile::fake()->image('image.jpg', 400, 300),
        ];
        
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/contributions', [
                'title' => 'Test Contribution with Attachments',
                'content' => ['blocks' => [['type' => 'paragraph', 'data' => ['text' => 'Test content']]]],
                'type' => 'project',
                'allow_collab' => false,
                'is_public' => true,
                'attachments' => $attachments,
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'title',
                    'content',
                    'type',
                    'thumbnail_url',
                    'attachments',
                    'user'
                ]
            ]);

        // Verify files were stored
        $contribution = Contribution::first();
        $this->assertNotNull($contribution->attachments);
        $this->assertCount(2, $contribution->attachments);
        
        foreach ($contribution->attachments as $attachment) {
            $this->assertStringContains('contributions/attachments', $attachment);
        }
        
        // Verify attachment URLs are returned
        $this->assertCount(2, $response->json('data.attachments'));
    }

    public function test_can_update_contribution_files()
    {
        $user = User::factory()->create();
        $contribution = Contribution::factory()->create(['user_id' => $user->id]);
        
        $newThumbnail = UploadedFile::fake()->image('new-thumbnail.jpg', 800, 600);
        
        $response = $this->actingAs($user, 'sanctum')
            ->putJson("/api/contributions/{$contribution->id}", [
                'title' => 'Updated Contribution',
                'content' => ['blocks' => [['type' => 'paragraph', 'data' => ['text' => 'Updated content']]]],
                'type' => 'idea',
                'allow_collab' => true,
                'is_public' => true,
                'status' => 'active',
                'thumbnail_url' => $newThumbnail,
            ]);

        $response->assertStatus(200);
        
        // Verify new thumbnail was stored
        $contribution->refresh();
        $this->assertNotNull($contribution->thumbnail_url);
        $this->assertStringContains('contributions/thumbnails', $contribution->thumbnail_url);
    }

    public function test_file_validation_works()
    {
        $user = User::factory()->create();
        
        $invalidFile = UploadedFile::fake()->create('document.exe', 1024);
        
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/contributions', [
                'title' => 'Test Contribution',
                'content' => ['blocks' => [['type' => 'paragraph', 'data' => ['text' => 'Test content']]]],
                'type' => 'idea',
                'attachments' => [$invalidFile],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['attachments.0']);
    }
}
