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
