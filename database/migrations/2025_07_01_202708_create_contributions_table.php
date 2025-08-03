<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('contributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->string('title')->nullable();
            $table->json('content')->nullable();
            $table->enum('type', ['idea', 'question', 'guide', 'research', 'project'])->nullable();
            $table->boolean('allow_collab')->default(false);
            $table->boolean('is_public')->default(true);
            $table->enum('status', ['draft', 'active', 'completed'])->default('draft');
            $table->integer('views_count')->default(0);
            $table->string('thumbnail_url')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contributions');
    }
};
