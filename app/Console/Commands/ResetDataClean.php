<?php

namespace App\Console\Commands;

use App\Models\Attendance;
use App\Models\Company;
use App\Models\DailyJournal;
use App\Models\PrayerLog;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class ResetDataClean extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'data:clean-reset';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Hapus semua data siswa, guru, presensi, jurnal, salat, dan sisakan akun admin admin@amaliah.com';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Membersihkan seluruh data relasi...');

        Schema::disableForeignKeyConstraints();

        DB::table('attendances')->truncate();
        DB::table('daily_journals')->truncate();
        DB::table('prayer_logs')->truncate();

        if (Schema::hasTable('suspicious_locations')) {
            DB::table('suspicious_locations')->truncate();
        }

        DB::table('users')->truncate();

        Schema::enableForeignKeyConstraints();

        $this->info('Membuat akun Admin tunggal...');

        User::create([
            'name' => 'Administrator PKL',
            'slug' => 'admin',
            'email' => 'admin@amaliah.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
            'role' => 'admin',
            'nis_nip' => '198501012010011001',
            'phone' => '081211112222',
        ]);

        $this->info('Sukses! Seluruh data guru, siswa, presensi, jurnal, dan salat telah dihapus.');
        $this->info('Akun Admin:');
        $this->info('Email: admin@amaliah.com');
        $this->info('Password: password123');

        return Command::SUCCESS;
    }
}
