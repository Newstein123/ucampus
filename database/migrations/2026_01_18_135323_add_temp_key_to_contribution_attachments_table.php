<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('contribution_attachments', function (Blueprint $table) {
            // Drop the foreign key constraint first
            // Laravel auto-generates constraint name as: {table}_{column}_foreign
            $table->dropForeign(['contribution_id']);
        });

        // Modify the column to be nullable (database-specific syntax)
        $driver = config('database.default');
        if ($driver === 'pgsql') {
            // PostgreSQL syntax
            DB::statement('ALTER TABLE contribution_attachments ALTER COLUMN contribution_id DROP NOT NULL');
        } else {
            // MySQL/MariaDB syntax
            DB::statement('ALTER TABLE contribution_attachments MODIFY contribution_id BIGINT UNSIGNED NULL');
        }

        Schema::table('contribution_attachments', function (Blueprint $table) {
            // Add temp_key column
            // Note: PostgreSQL doesn't support 'after', so we'll add it at the end
            if (config('database.default') === 'pgsql') {
                $table->string('temp_key')->nullable();
            } else {
                $table->string('temp_key')->nullable()->after('contribution_id');
            }

            // Re-add the foreign key constraint (nullable)
            $table->foreign('contribution_id')->references('id')->on('contributions')->onDelete('cascade');

            // Add index on temp_key for faster lookups
            $table->index('temp_key');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contribution_attachments', function (Blueprint $table) {
            // Drop foreign key
            $table->dropForeign(['contribution_id']);
        });

        // Drop temp_key index and column
        Schema::table('contribution_attachments', function (Blueprint $table) {
            $table->dropIndex(['temp_key']);
            $table->dropColumn('temp_key');
        });

        // Make contribution_id not nullable again (database-specific syntax)
        $driver = config('database.default');
        if ($driver === 'pgsql') {
            // PostgreSQL syntax
            DB::statement('ALTER TABLE contribution_attachments ALTER COLUMN contribution_id SET NOT NULL');
        } else {
            // MySQL/MariaDB syntax
            DB::statement('ALTER TABLE contribution_attachments MODIFY contribution_id BIGINT UNSIGNED NOT NULL');
        }

        Schema::table('contribution_attachments', function (Blueprint $table) {
            // Re-add foreign key constraint
            $table->foreign('contribution_id')->references('id')->on('contributions')->onDelete('cascade');
        });
    }
};
