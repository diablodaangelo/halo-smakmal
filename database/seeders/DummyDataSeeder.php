<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Company;
use App\Models\DailyJournal;
use App\Models\PrayerLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        $defaultPassword = Hash::make('password123');

        // 1. Bersihkan semua data riwayat & user selain admin
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        PrayerLog::truncate();
        DailyJournal::truncate();
        Attendance::truncate();
        User::where('email', '!=', 'admin@amaliah.com')->delete();
        Company::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 2. Pastikan Akun Admin tetap ada dan password-nya password123
        $admin = User::firstOrCreate(
            ['email' => 'admin@amaliah.com'],
            [
                'name' => 'Administrator PKL',
                'slug' => 'admin',
                'password' => $defaultPassword,
                'email_verified_at' => now(),
                'role' => 'admin',
                'nis_nip' => '198501012010011001',
                'phone' => '081211112222',
            ]
        );
        $admin->update([
            'password' => $defaultPassword,
            'role' => 'admin',
        ]);

        // 3. Buat Data Perusahaan / DUDI
        $telkomsel = Company::create([
            'name' => 'PT Telekomunikasi Seluler (Telkomsel) Bogor',
            'address' => 'Jl. Pajajaran No. 37, Babakan, Bogor Tengah, Kota Bogor, Jawa Barat',
            'latitude' => -6.59714700,
            'longitude' => 106.80603900,
            'radius_meters' => 100,
            'check_in_start' => '07:00:00',
            'check_in_end' => '08:05:00',
            'check_out_start' => '16:30:00',
        ]);

        $amaliah = Company::create([
            'name' => 'PT Amaliah Digital Inovasi',
            'address' => 'Jl. Raya Tol Ciawi No. 1, Ciawi, Bogor, Jawa Barat',
            'latitude' => -6.65432100,
            'longitude' => 106.87654321,
            'radius_meters' => 120,
            'check_in_start' => '07:30:00',
            'check_in_end' => '08:05:00',
            'check_out_start' => '17:00:00',
        ]);

        // 4. Buat Akun Guru Pembimbing (@amaliah.com)
        $guru = User::create([
            'name' => 'Raden Hendriawan, S.Kom.',
            'slug' => 'raden-hendriawan',
            'email' => 'radenhendriawan@amaliah.com',
            'password' => $defaultPassword,
            'email_verified_at' => now(),
            'role' => 'guru_pembimbing',
            'nis_nip' => '198503152010011002',
            'phone' => '081234567890',
        ]);

        // 5. Buat Akun Siswa PKL (@amaliah.com)
        $siswa1 = User::create([
            'name' => 'Pajar Ramdani',
            'slug' => 'pajar-ramdani',
            'email' => 'pajarramdani@amaliah.com',
            'password' => $defaultPassword,
            'email_verified_at' => now(),
            'role' => 'siswa',
            'nis_nip' => '212210001',
            'class_name' => 'XII RPL 1',
            'company_id' => $telkomsel->id,
            'mentor_teacher_id' => $guru->id,
            'phone' => '085711223344',
        ]);

        $siswa2 = User::create([
            'name' => 'Muhammad Malik Fajar',
            'slug' => 'muhammad-malik-fajar',
            'email' => 'muhammadmalikfajar@amaliah.com',
            'password' => $defaultPassword,
            'email_verified_at' => now(),
            'role' => 'siswa',
            'nis_nip' => '212210002',
            'class_name' => 'XII RPL 1',
            'company_id' => $telkomsel->id,
            'mentor_teacher_id' => $guru->id,
            'phone' => '085722334455',
        ]);

        $siswa3 = User::create([
            'name' => 'Siti Nurhaliza',
            'slug' => 'siti-nurhaliza',
            'email' => 'siti@amaliah.com',
            'password' => $defaultPassword,
            'email_verified_at' => now(),
            'role' => 'siswa',
            'nis_nip' => '212210003',
            'class_name' => 'XII TKJ 2',
            'company_id' => $amaliah->id,
            'mentor_teacher_id' => $guru->id,
            'phone' => '085733445566',
        ]);

        $students = [$siswa1, $siswa2, $siswa3];

        // Bank data kegiatan jurnal yang bervariasi
        $activities = [
            'Melakukan konfigurasi router MikroTik dan setting bandwidth management untuk departemen finance.',
            'Pengecekan dan perapian kabel patch cord pada rak server utama data center.',
            'Membantu instalasi sistem operasi Windows 11 dan software perkantoran pada 5 unit PC staf baru.',
            'Troubleshooting printer jaringan yang mengalami error spooler dan tidak terdeteksi oleh klien.',
            'Membuat backup berkala database MySQL server lokal ke storage NAS eksternal.',
            'Melakukan crimping kabel UTP Cat6 dan pengetesan redaman sinyal dengan LAN tester.',
            'Membantu monitoring performa utilisasi CPU dan RAM server aplikasi web menggunakan Zabbix.',
            'Peremajaan access point WiFi lantai 2 dan setting SSID baru untuk tamu kantor.',
            'Melakukan inventarisasi nomor seri dan spesifikasi perangkat keras komputer bagian operasional.',
            'Membuat script automasi backup file harian menggunakan Bash/PowerShell.',
            'Testing endpoint REST API sistem internal menggunakan Postman dan mendokumentasikan response code.',
            'Membantu perakitan PC workstation tim multimedia dan instalasi driver VGA.',
            'Konfigurasi VLAN pada switch Cisco untuk memisahkan traffic jaringan staf dan tamu.',
            'Memeriksa log aktivitas firewall untuk mendeteksi anomali traffic jaringan.',
            'Mendampingi teknisi senior melakukan maintenance rutin genset dan UPS ruang server.',
            'Melakukan slicing desain UI landing page promo ke format HTML dan Tailwind CSS.',
            'Merapikan dokumentasi user manual penggunaan aplikasi internal bagi karyawan baru.',
            'Pembersihan fisik (maintenance hardware) CPU unit server dan penggantian thermal paste processor.',
            'Setting shared printer dan shared folder pada jaringan workgroup kantor cabang.',
            'Mengikuti meeting evaluasi mingguan tim IT support mengenai kendala jaringan pengguna.'
        ];

        $obstaclesList = [
            'Tidak ada kendala, pekerjaan berjalan lancar sesuai instruksi pembimbing.',
            'Konektor RJ45 sempat habis stok sehingga harus menunggu pengadaan dari logistik.',
            'Koneksi internet provider sempat down selama 15 menit saat proses download ISO Windows.',
            'Port switch LAN pada meja kerja sempat longgar, berhasil diperbaiki dengan mengganti kabel patch.',
            'Driver printer lama tidak kompatibel dengan Windows 64-bit, diatasi dengan mencari driver universal.',
            'Kabel tester kehabisan baterai 9V, meminjam peralatan dari divisi hardware.',
            'Tidak ada kendala yang berarti, semua tugas terselesaikan tepat waktu.',
            'Dokumentasi teknis perangkat berbahasa Inggris, membutuhkan waktu lebih untuk memahami diagram blok.'
        ];

        $mentorFeedbackList = [
            'Kerja bagus, pertahankan ketelitian dan kedisiplinan dalam bekerja.',
            'Sangat baik, cara dokumentasi sudah rapi dan sistematis.',
            'Bagus, pastikan selalu cek kembali konfigurasi sebelum implementasi ke live server.',
            'Pekerjaan rapi sesuai standar SOP perusahaan, lanjutkan.',
            'Pertahankan performa dan komunikasi yang baik dengan tim teknis.',
            'Bagus, jangan sungkan untuk bertanya jika menemukan arsitektur jaringan yang belum dipahami.'
        ];

        $sampleCheckinPhoto = 'attendances/checkin/h3M9Uo8j128sjAPbpVp0gQij.jpg';
        $sampleCheckoutPhoto = 'attendances/checkout/Nz88SRGoxwkV6x6DwenokupK.jpg';
        $samplePermissionDoc = 'attendances/permissions/fceMhyCGDBNRe86tov5QEJUQsaBpIUKev6RJ8x7v.jpg';

        // 6. Generate Data dari 2 Bulan Lalu (Mulai 17 Agustus 2026 s.d. 18 Oktober 2026)
        $startDate = Carbon::create(2026, 8, 17);
        $endDate = Carbon::create(2026, 10, 18);

        // Kumpulkan semua hari kerja (Senin - Jumat)
        $workdays = [];
        $cursor = $startDate->copy();
        while ($cursor->lte($endDate)) {
            if ($cursor->isWeekday()) {
                $workdays[] = $cursor->copy();
            }
            $cursor->addDay();
        }

        foreach ($students as $studentIndex => $student) {
            $company = $student->company;
            $dayNumber = 1;

            foreach ($workdays as $index => $currentDate) {
                $dateStr = $currentDate->format('Y-m-d');
                $isAugust = $currentDate->month === 8;
                $isSeptember = $currentDate->month === 9;
                $isOctober = $currentDate->month === 10;

                // Tentukan status kehadiran secara variatif
                $status = 'hadir';
                $checkInTime = sprintf('07:%02d:00', rand(35, 58)); // Tepat waktu (sebelum 08:05)
                $checkOutTime = sprintf('16:%02d:00', rand(35, 55));
                $permissionReason = null;
                $permissionDoc = null;
                $isApproved = null;
                $approvedBy = null;
                $approvedAt = null;

                // Variasi 1: Terlambat pada tanggal tertentu
                if (($studentIndex === 0 && in_array($index, [8, 22])) ||
                    ($studentIndex === 1 && in_array($index, [5, 19, 33])) ||
                    ($studentIndex === 2 && in_array($index, [12, 27]))) {
                    $status = 'terlambat';
                    $checkInTime = sprintf('08:%02d:00', rand(10, 25)); // Masuk setelah 08:05
                }

                // Variasi 2: Sakit di bulan September (sudah disetujui guru)
                if (($studentIndex === 0 && $index === 15) ||
                    ($studentIndex === 1 && $index === 18) ||
                    ($studentIndex === 2 && $index === 20)) {
                    $status = 'sakit';
                    $checkInTime = null;
                    $checkOutTime = null;
                    $permissionReason = 'Demam tinggi dan flu, disarankan istirahat dokter selama 1 hari.';
                    $permissionDoc = $samplePermissionDoc;
                    $isApproved = true;
                    $approvedBy = $guru->id;
                    $approvedAt = $currentDate->copy()->setTime(9, 30);
                }

                // Variasi 3: Izin di bulan Oktober (1 sudah disetujui, 1 masih PENDING untuk bahan testing guru)
                if ($studentIndex === 0 && $index === 36) { // Sekitar awal Oktober (Approved)
                    $status = 'izin';
                    $checkInTime = null;
                    $checkOutTime = null;
                    $permissionReason = 'Mengikuti seleksi LKS IT Network Systems tingkat kota.';
                    $permissionDoc = $samplePermissionDoc;
                    $isApproved = true;
                    $approvedBy = $guru->id;
                    $approvedAt = $currentDate->copy()->setTime(8, 45);
                }

                if ($studentIndex === 0 && $index === count($workdays) - 1) { // Hari kerja terakhir (PENDING)
                    $status = 'izin';
                    $checkInTime = null;
                    $checkOutTime = null;
                    $permissionReason = 'Ada urusan penting keluarga di luar kota.';
                    $permissionDoc = $samplePermissionDoc;
                    $isApproved = null; // PENDING: Tombol setujui / tolak akan muncul di review pembimbing!
                    $approvedBy = null;
                    $approvedAt = null;
                }

                // Variasi 4: Lupa Check-out pada hari kerja kedua terakhir
                if ($studentIndex === 0 && $index === count($workdays) - 2) {
                    $status = 'hadir';
                    $checkOutTime = null; // Lupa check-out
                }

                // Simpan Presensi
                $latOffset = (rand(-50, 50) / 1000000);
                $longOffset = (rand(-50, 50) / 1000000);

                $att = Attendance::create([
                    'user_id' => $student->id,
                    'company_id' => $company->id,
                    'date' => $dateStr,
                    'check_in_time' => $checkInTime,
                    'check_out_time' => $checkOutTime,
                    'check_in_lat' => $checkInTime ? ((float) $company->latitude + $latOffset) : null,
                    'check_in_long' => $checkInTime ? ((float) $company->longitude + $longOffset) : null,
                    'check_out_lat' => $checkOutTime ? ((float) $company->latitude + $latOffset) : null,
                    'check_out_long' => $checkOutTime ? ((float) $company->longitude + $longOffset) : null,
                    'selfie_path' => $checkInTime ? $sampleCheckinPhoto : null,
                    'check_out_selfie_path' => $checkOutTime ? $sampleCheckoutPhoto : null,
                    'status' => $status,
                    'permission_reason' => $permissionReason,
                    'permission_doc' => $permissionDoc,
                    'is_approved' => $isApproved,
                    'approved_by' => $approvedBy,
                    'approved_at' => $approvedAt,
                ]);

                // Simpan Jurnal Harian PKL
                $actText = $activities[($index + $studentIndex) % count($activities)];
                $obsText = $obstaclesList[($index + $studentIndex) % count($obstaclesList)];

                // Jurnal bulan Agustus dan September sudah direview guru
                // Jurnal bulan Oktober sebagian dibiarkan belum direview (null) agar bisa ditest di /teacher/journals
                $mentorNotes = null;
                $journalStatus = 'pending';
                if ($isAugust || $isSeptember || ($isOctober && $index % 3 === 0)) {
                    $mentorNotes = $mentorFeedbackList[($index + $studentIndex) % count($mentorFeedbackList)];
                    $journalStatus = 'approved';
                }

                $journal = DailyJournal::create([
                    'user_id' => $student->id,
                    'day_number' => $dayNumber,
                    'attendance_id' => $att->id,
                    'date' => $dateStr,
                    'work_summary' => $actText,
                    'obstacles' => ($status === 'sakit' || $status === 'izin') ? 'Sedang ' . $status . ' (tidak ada kegiatan di kantor)' : $obsText,
                    'work_photo' => ($status === 'hadir' || $status === 'terlambat') ? $sampleCheckinPhoto : null,
                    'status' => $journalStatus,
                    'mentor_notes' => $mentorNotes,
                ]);

                // Simpan Log Salat (Dzuhur & Ashar)
                if ($status === 'hadir' || $status === 'terlambat') {
                    // Dzuhur
                    PrayerLog::create([
                        'user_id' => $student->id,
                        'daily_journal_id' => $journal->id,
                        'date' => $dateStr,
                        'prayer_type' => 'dzuhur',
                        'prayer_time' => sprintf('12:%02d:00', rand(10, 25)),
                        'location_name' => 'Musala Kantor ' . $company->name,
                        'status' => (rand(1, 10) > 2) ? 'berjamaah' : 'munfarid',
                    ]);

                    // Ashar
                    PrayerLog::create([
                        'user_id' => $student->id,
                        'daily_journal_id' => $journal->id,
                        'date' => $dateStr,
                        'prayer_type' => 'ashar',
                        'prayer_time' => sprintf('15:%02d:00', rand(35, 48)),
                        'location_name' => 'Musala Kantor ' . $company->name,
                        'status' => (rand(1, 10) > 3) ? 'berjamaah' : 'munfarid',
                    ]);
                } else {
                    // Jika izin / sakit
                    PrayerLog::create([
                        'user_id' => $student->id,
                        'daily_journal_id' => $journal->id,
                        'date' => $dateStr,
                        'prayer_type' => 'dzuhur',
                        'prayer_time' => null,
                        'location_name' => null,
                        'status' => 'udzur',
                    ]);

                    PrayerLog::create([
                        'user_id' => $student->id,
                        'daily_journal_id' => $journal->id,
                        'date' => $dateStr,
                        'prayer_type' => 'ashar',
                        'prayer_time' => null,
                        'location_name' => null,
                        'status' => 'udzur',
                    ]);
                }

                $dayNumber++;
            }
        }
    }
}
