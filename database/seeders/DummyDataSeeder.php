<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Company;
use App\Models\DailyJournal;
use App\Models\PrayerLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        $defaultPassword = Hash::make('password123');

        // Pastikan Companies ada
        $telkomsel = Company::firstOrCreate(
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

        $amaliah = Company::firstOrCreate(
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

        // Update Pembimbing DUDI
        $mentorDudi = User::where('role', 'pembimbing_dudi')->first();
        if ($mentorDudi) {
            $mentorDudi->update(['company_id' => $telkomsel->id]);
        }

        // Ambil Guru Pembimbing
        $guru = User::where('role', 'guru_pembimbing')->first();

        // Ambil Siswa
        $siswa1 = User::where('email', 'siswa1@smkamaliah.sch.id')->first();
        $siswa2 = User::where('email', 'siswa2@smkamaliah.sch.id')->first();
        $siswa3 = User::where('email', 'siswa3@smkamaliah.sch.id')->first();

        if ($guru) {
            if ($siswa1) $siswa1->update(['mentor_teacher_id' => $guru->id]);
            if ($siswa2) $siswa2->update(['mentor_teacher_id' => $guru->id]);
            if ($siswa3) $siswa3->update(['company_id' => $amaliah->id, 'mentor_teacher_id' => $guru->id]);
        }

        // Generate Sample Records selama 3 hari ke belakang
        $dates = [
            Carbon::now()->subDays(2)->toDateString(),
            Carbon::now()->subDays(1)->toDateString(),
            Carbon::now()->toDateString(),
        ];

        if ($siswa1) {
            foreach ($dates as $index => $date) {
                $att = Attendance::firstOrCreate(
                    ['user_id' => $siswa1->id, 'date' => $date],
                    [
                        'company_id' => $telkomsel->id,
                        'check_in_time' => '07:45:00',
                        'check_out_time' => '16:35:00',
                        'check_in_lat' => -6.59714500,
                        'check_in_long' => 106.80603500,
                        'check_out_lat' => -6.59714500,
                        'check_out_long' => 106.80603500,
                        'selfie_path' => 'attendances/sample_selfie_1.jpg',
                        'status' => 'hadir',
                    ]
                );

                $journal = DailyJournal::firstOrCreate(
                    ['attendance_id' => $att->id],
                    [
                        'user_id' => $siswa1->id,
                        'date' => $date,
                        'work_summary' => 'Hari ke-' . ($index + 1) . ': Melakukan instalasi kabel jaringan LAN dan konfigurasi IP address router gateway kantor.',
                        'obstacles' => 'Beberapa konektor RJ45 rusak dan perlu diganti.',
                        'status' => ($index === 2) ? 'pending' : 'approved',
                        'mentor_notes' => ($index === 2) ? null : 'Pekerjaan rapi dan sesuai SOP.',
                    ]
                );

                PrayerLog::firstOrCreate(
                    ['daily_journal_id' => $journal->id, 'prayer_type' => 'dzuhur'],
                    [
                        'prayer_time' => '12:15:00',
                        'location_name' => 'Masjid Raya Bogor',
                        'status' => 'berjamaah',
                    ]
                );

                PrayerLog::firstOrCreate(
                    ['daily_journal_id' => $journal->id, 'prayer_type' => 'ashar'],
                    [
                        'prayer_time' => '15:30:00',
                        'location_name' => 'Musala Telkomsel',
                        'status' => 'munfarid',
                    ]
                );
            }
        }

        if ($siswa2) {
            foreach ($dates as $index => $date) {
                $att = Attendance::firstOrCreate(
                    ['user_id' => $siswa2->id, 'date' => $date],
                    [
                        'company_id' => $telkomsel->id,
                        'check_in_time' => '07:50:00',
                        'check_out_time' => '16:40:00',
                        'check_in_lat' => -6.59714500,
                        'check_in_long' => 106.80603500,
                        'check_out_lat' => -6.59714500,
                        'check_out_long' => 106.80603500,
                        'selfie_path' => 'attendances/sample_selfie_2.jpg',
                        'status' => 'hadir',
                    ]
                );

                $journal = DailyJournal::firstOrCreate(
                    ['attendance_id' => $att->id],
                    [
                        'user_id' => $siswa2->id,
                        'date' => $date,
                        'work_summary' => 'Hari ke-' . ($index + 1) . ': Membantu tim administrasi merekap data laporan inventaris server dan perangkat IT.',
                        'obstacles' => 'Tidak ada kendala',
                        'status' => 'approved',
                        'mentor_notes' => 'Laporan sangat detail dan terstruktur.',
                    ]
                );

                PrayerLog::firstOrCreate(
                    ['daily_journal_id' => $journal->id, 'prayer_type' => 'dzuhur'],
                    [
                        'prayer_time' => null,
                        'location_name' => null,
                        'status' => 'udzur',
                    ]
                );

                PrayerLog::firstOrCreate(
                    ['daily_journal_id' => $journal->id, 'prayer_type' => 'ashar'],
                    [
                        'prayer_time' => null,
                        'location_name' => null,
                        'status' => 'udzur',
                    ]
                );
            }
        }
    }
}
