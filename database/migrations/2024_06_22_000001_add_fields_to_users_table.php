<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->unique()->after('name');
            $table->string('phone')->unique()->nullable()->after('email');
            $table->date('dob')->nullable()->after('password');
            $table->string('location')->nullable()->after('dob');
            $table->dateTime('last_login_at')->nullable()->after('location');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['username', 'phone', 'dob', 'location', 'last_login_at']);
        });
    }
};
