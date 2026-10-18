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
        // Akun Admin Utama
        User::updateOrCreate(
            ['email' => 'admin@amaliah.com'],
            [
                'name' => 'Administrator PKL',
                'slug' => 'admin',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
                'role' => 'admin',
                'nis_nip' => '198501012010011001',
                'phone' => '081211112222',
            ]
        );
    }
}
