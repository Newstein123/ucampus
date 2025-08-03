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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recipient_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('sender_user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('type')->note('e.g., new_discussion, collab_request, project_update, contribution_liked');
            $table->morphs('source');
            $table->text('message')->nullable();
            $table->boolean('is_read')->default(false);
            $table->string('redirect_url')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
