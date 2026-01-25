<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::firstOrCreate(
            ['email' => 'admin@ucampus.com'],
            [
                'name' => 'Admin User',
                'username' => 'admin',
                'password' => Hash::make('admin123'),
                'phone' => '09999999999',
                'dob' => '1990-01-01',
                'location' => 'Yangon',
                'is_admin' => true,
                'is_active' => true,
            ]
        );

        // Create regular test users
        User::create([
            'name' => 'Test1',
            'email' => 'test1@gmail.com',
            'password' => Hash::make('password'),
            'username' => 'test1',
            'phone' => '081234567890',
            'dob' => '1990-01-01',
            'location' => 'Yangon',
        ]);
        User::create([
            'name' => 'Test2',
            'email' => 'test2@gmail.com',
            'password' => Hash::make('password'),
            'username' => 'test2',
            'phone' => '081234567891',
            'dob' => '1990-01-01',
            'location' => 'Mandalay',
        ]);
        User::create([
            'name' => 'Test3',
            'email' => 'test3@gmail.com',
            'password' => Hash::make('password'),
            'username' => 'test3',
            'phone' => '081234567892',
            'dob' => '1990-01-01',
            'location' => 'Naypyidaw',
        ]);
    }
}
