<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaultPassword = Hash::make('password123');

        // 1. Kantor DUDI 1: Telkomsel Bogor
        $companyTelkom = Company::firstOrCreate(
            ['name' => 'PT Telekomunikasi Seluler (Telkomsel) Bogor'],
            [
                'address' => 'Jl. Pajajaran No. 37, Babakan, Bogor Tengah, Kota Bogor, Jawa Barat',
                'latitude' => -6.59714700,
                'longitude' => 106.80603900,
                'radius_meters' => 100,
                'check_in_start' => '07:00:00',
                'check_in_end' => '08:30:00',
                'check_out_start' => '16:30:00',
            ]
        );

        // 2. Kantor DUDI 2: PT Amaliah Digital Inovasi
        $companyAmaliah = Company::firstOrCreate(
            ['name' => 'PT Amaliah Digital Inovasi'],
            [
                'address' => 'Jl. Raya Tol Ciawi No. 1, Ciawi, Bogor, Jawa Barat',
                'latitude' => -6.65432100,
                'longitude' => 106.87654321,
                'radius_meters' => 120,
                'check_in_start' => '07:30:00',
                'check_in_end' => '08:30:00',
                'check_out_start' => '17:00:00',
            ]
        );

        // 3. Siswa Terassign ke Telkomsel Bogor
        User::firstOrCreate(
            ['email' => 'siswa1@smkamaliah.sch.id'],
            [
                'name' => 'Budi Santoso',
                'password' => $defaultPassword,
                'role' => 'siswa',
                'nis_nip' => '2122001',
                'company_id' => $companyTelkom->id,
                'phone' => '081290000001',
            ]
        );

        User::firstOrCreate(
            ['email' => 'siswa2@smkamaliah.sch.id'],
            [
                'name' => 'Siti Nurhaliza',
                'password' => $defaultPassword,
                'role' => 'siswa',
                'nis_nip' => '2122002',
                'company_id' => $companyTelkom->id,
                'phone' => '081290000002',
            ]
        );

        // 4. Siswa Belum Terassign (Unassigned)
        User::firstOrCreate(
            ['email' => 'siswa3@smkamaliah.sch.id'],
            [
                'name' => 'Rizky Ramadhan',
                'password' => $defaultPassword,
                'role' => 'siswa',
                'nis_nip' => '2122003',
                'company_id' => null,
                'phone' => '081290000003',
            ]
        );

        User::firstOrCreate(
            ['email' => 'siswa4@smkamaliah.sch.id'],
            [
                'name' => 'Dewi Sartika',
                'password' => $defaultPassword,
                'role' => 'siswa',
                'nis_nip' => '2122004',
                'company_id' => null,
                'phone' => '081290000004',
            ]
        );
    }
}
