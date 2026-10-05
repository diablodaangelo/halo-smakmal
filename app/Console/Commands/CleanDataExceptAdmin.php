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

class CleanDataExceptAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'data:clean-except-admin';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Hapus semua data siswa, guru, dudi, jurnal, dan presensi, sisakan akun admin saja.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->warn('Membersihkan seluruh data database kecuali akun Admin...');

        Schema::disableForeignKeyConstraints();

        // 1. Truncate tabel-tabel transaksi/kegiatan
        if (Schema::hasTable('prayer_logs')) {
            DB::table('prayer_logs')->truncate();
            $this->info('✓ Tabel prayer_logs dikosongkan.');
        }

        if (Schema::hasTable('suspicious_flags')) {
            DB::table('suspicious_flags')->truncate();
            $this->info('✓ Tabel suspicious_flags dikosongkan.');
        }

        if (Schema::hasTable('daily_journals')) {
            DB::table('daily_journals')->truncate();
            $this->info('✓ Tabel daily_journals dikosongkan.');
        }

        if (Schema::hasTable('attendances')) {
            DB::table('attendances')->truncate();
            $this->info('✓ Tabel attendances dikosongkan.');
        }

        if (Schema::hasTable('companies')) {
            DB::table('companies')->truncate();
            $this->info('✓ Tabel companies dikosongkan.');
        }

        // 2. Hapus semua user selain admin
        $deletedUsers = DB::table('users')->where('role', '!=', 'admin')->delete();
        $this->info("✓ Sebanyak {$deletedUsers} akun non-admin berhasil dihapus.");

        // 3. Pastikan minimal ada 1 akun admin default
        $adminCount = DB::table('users')->where('role', 'admin')->count();
        if ($adminCount === 0) {
            DB::table('users')->insert([
                'name' => 'Administrator SMK Amaliah',
                'email' => 'admin@smkamaliah.sch.id',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'nis_nip' => '198501012010011001',
                'phone' => '081211112222',
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $this->info('✓ Akun admin default dibuat: admin@smkamaliah.sch.id / password123');
        } else {
            $this->info("✓ Akun admin tetap terjaga ({$adminCount} akun admin).");
        }

        Schema::enableForeignKeyConstraints();

        $this->info('Semua data berhasil dibersihkan! Database sekarang bersih dan hanya menyisakan Admin.');

        return Command::SUCCESS;
    }
}
