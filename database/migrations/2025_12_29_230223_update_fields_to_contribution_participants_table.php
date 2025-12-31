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
        Schema::table('contribution_participants', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->constrained('contribution_roles');
            $table->renameColumn('reason', 'join_reason');
            $table->renameColumn('response', 'join_response');
            $table->string('left_reason')->nullable();
            $table->enum('left_action', ['self', 'owner', 'system'])->nullable();
            $table->timestamp('left_at')->nullable();
        });

        // For PostgreSQL, we need to use raw SQL to update the enum constraint
        if (config('database.default') === 'pgsql') {
            // Find and drop any existing check constraint on the status column
            $constraints = DB::select("
                SELECT constraint_name 
                FROM information_schema.constraint_column_usage 
                WHERE table_name = 'contribution_participants' 
                AND column_name = 'status'
                AND constraint_name LIKE '%status%check%'
            ");

            foreach ($constraints as $constraint) {
                DB::statement("ALTER TABLE contribution_participants DROP CONSTRAINT IF EXISTS {$constraint->constraint_name}");
            }

            // Alter column type
            DB::statement("ALTER TABLE contribution_participants ALTER COLUMN status TYPE VARCHAR(255)");

            // Add new check constraint
            DB::statement("
                ALTER TABLE contribution_participants 
                ADD CONSTRAINT contribution_participants_status_check 
                CHECK (status IN ('pending', 'accepted', 'rejected', 'active', 'left', 'removed'))
            ");

            // Set default and not null
            DB::statement("ALTER TABLE contribution_participants ALTER COLUMN status SET DEFAULT 'pending'");
            DB::statement("ALTER TABLE contribution_participants ALTER COLUMN status SET NOT NULL");
        } else {
            // For MySQL, use Laravel's enum change
            Schema::table('contribution_participants', function (Blueprint $table) {
                $table->enum('status', ['pending', 'accepted', 'rejected', 'active', 'left', 'removed'])->default('pending')->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('contribution_participants', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn('role_id');
            $table->renameColumn('join_reason', 'reason');
            $table->renameColumn('join_response', 'response');
            $table->dropColumn('left_reason');
            $table->dropColumn('left_action');
            $table->dropColumn('left_at');
        });

        // For PostgreSQL, we need to use raw SQL to update the enum constraint
        if (config('database.default') === 'pgsql') {
            // Find and drop any existing check constraint on the status column
            $constraints = DB::select("
                SELECT constraint_name 
                FROM information_schema.constraint_column_usage 
                WHERE table_name = 'contribution_participants' 
                AND column_name = 'status'
                AND constraint_name LIKE '%status%check%'
            ");

            foreach ($constraints as $constraint) {
                DB::statement("ALTER TABLE contribution_participants DROP CONSTRAINT IF EXISTS {$constraint->constraint_name}");
            }

            // Alter column type
            DB::statement("ALTER TABLE contribution_participants ALTER COLUMN status TYPE VARCHAR(255)");

            // Add new check constraint
            DB::statement("
                ALTER TABLE contribution_participants 
                ADD CONSTRAINT contribution_participants_status_check 
                CHECK (status IN ('pending', 'accepted', 'rejected', 'active', 'left', 'removed'))
            ");

            // Set default and not null
            DB::statement("ALTER TABLE contribution_participants ALTER COLUMN status SET DEFAULT 'pending'");
            DB::statement("ALTER TABLE contribution_participants ALTER COLUMN status SET NOT NULL");
        } else {
            // For MySQL, use Laravel's enum change
            Schema::table('contribution_participants', function (Blueprint $table) {
                $table->enum('status', ['pending', 'accepted', 'rejected', 'active', 'left', 'removed'])->default('pending')->change();
            });
        }
    }
};
