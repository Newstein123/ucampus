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
        Schema::table('contribution_notes', function (Blueprint $table) {
            $table->string('content_key')->nullable()->after('type');
            $table->string('status', 20)->default('pending')->after('content_key')->comment('pending, resolved, rejected');
            $table->foreignId('resolved_by')->nullable()->after('status')->constrained('users')->onDelete('set null');
            $table->timestamp('resolved_at')->nullable()->after('resolved_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contribution_notes', function (Blueprint $table) {
            $table->dropForeign(['resolved_by']);
            $table->dropColumn(['content_key', 'status', 'resolved_by', 'resolved_at']);
        });
    }
};
