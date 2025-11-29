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
        Schema::create('contribution_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contribution_id')->constrained('contributions')->onDelete('cascade');
            $table->string('file_path'); // Relative path in MinIO
            $table->string('file_name'); // Original filename
            $table->string('file_type')->nullable(); // MIME type
            $table->integer('file_size')->nullable(); // Size in bytes
            $table->timestamps();

            $table->index('contribution_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contribution_attachments');
    }
};
