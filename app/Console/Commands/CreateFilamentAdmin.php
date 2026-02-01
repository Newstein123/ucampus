<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateFilamentAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'filament:create-admin 
                            {--name= : The name of the admin user}
                            {--email= : The email of the admin user}
                            {--username= : The username of the admin user (defaults to email if not provided)}
                            {--password= : The password for the admin user}
                            {--update : Update existing user if email exists}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a Filament admin user non-interactively';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $name = $this->option('name');
        $email = $this->option('email');
        $username = $this->option('username') ?: $email; // Default to email if username not provided
        $password = $this->option('password');
        $update = $this->option('update');

        // Validate required options
        if (!$name || !$email || !$password) {
            $this->error('All options are required: --name, --email, --password');
            $this->info('Usage: php artisan filament:create-admin --name="Admin Name" --email="admin@example.com" --password="password123" [--username="username"]');
            return 1;
        }

        // Check if user exists
        $user = User::where('email', $email)->first();

        if ($user) {
            if (!$update) {
                $this->error("User with email {$email} already exists. Use --update flag to update existing user.");
                return 1;
            }

            // Update existing user
            $user->update([
                'name' => $name,
                'username' => $username,
                'password' => Hash::make($password),
                'is_admin' => true,
                'is_active' => true,
            ]);

            $this->info("✓ Updated user '{$name}' ({$email}) to admin.");
        } else {
            // Create new user
            $user = User::create([
                'name' => $name,
                'username' => $username,
                'email' => $email,
                'password' => Hash::make($password),
                'is_admin' => true,
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            $this->info("✓ Created admin user '{$name}' ({$email}).");
        }

        return 0;
    }
}
