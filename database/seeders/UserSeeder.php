<?php

namespace Database\Seeders;

use App\Models\Company;
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
        // 1. Buat Dummy DUDI Company
        $company = Company::firstOrCreate(
            ['name' => 'PT Amaliah Digital Media'],
            [
                'address' => 'Jl. Tol Ciawi No. 1, Bogor, Jawa Barat',
                'latitude' => -6.65432100,
                'longitude' => 106.87654321,
                'radius_meters' => 100,
                'check_in_start' => '07:00:00',
                'check_in_end' => '08:00:00',
                'check_out_start' => '16:00:00',
            ]
        );

        $defaultPassword = Hash::make('password123');

        // 2. Akun Admin
        User::firstOrCreate(
            ['email' => 'admin@smkamaliah.sch.id'],
            [
                'name' => 'Administrator Sekolah',
                'password' => $defaultPassword,
                'role' => 'admin',
                'nis_nip' => '198501012010011001',
                'phone' => '081211112222',
            ]
        );

        // 3. Akun Guru Pembimbing
        User::firstOrCreate(
            ['email' => 'guru@smkamaliah.sch.id'],
            [
                'name' => 'Bpk. Guru Pembimbing',
                'password' => $defaultPassword,
                'role' => 'guru_pembimbing',
                'nis_nip' => '198703152015021002',
                'phone' => '081233334444',
            ]
        );

        // 4. Akun Pembimbing DUDI
        User::firstOrCreate(
            ['email' => 'dudi@company.com'],
            [
                'name' => 'Pembimbing DUDI',
                'password' => $defaultPassword,
                'role' => 'pembimbing_dudi',
                'company_id' => $company->id,
                'phone' => '081255556666',
            ]
        );

        // 5. Akun Siswa
        User::firstOrCreate(
            ['email' => 'siswa@smkamaliah.sch.id'],
            [
                'name' => 'Siswa Magang Amaliah',
                'password' => $defaultPassword,
                'role' => 'siswa',
                'nis_nip' => '12345678',
                'company_id' => $company->id,
                'phone' => '081277778888',
            ]
        );
    }
}
