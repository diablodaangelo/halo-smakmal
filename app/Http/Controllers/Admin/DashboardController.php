<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Company;
use App\Models\DailyJournal;
use App\Models\PrayerLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the Admin Dashboard with full PKL program statistics and metrics.
     */
    public function index(Request $request): Response
    {
        $today = Carbon::today()->toDateString();

        // 1. Metrik Siswa PKL
        $totalStudents = User::where('role', 'siswa')->count();
        $placedStudents = User::where('role', 'siswa')->whereNotNull('company_id')->count();
        $unplacedStudents = $totalStudents - $placedStudents;
        $placementRate = $totalStudents > 0 ? round(($placedStudents / $totalStudents) * 100, 1) : 0;

        $assignedTeacherStudents = User::where('role', 'siswa')->whereNotNull('mentor_teacher_id')->count();
        $unassignedTeacherStudents = $totalStudents - $assignedTeacherStudents;

        // 2. Metrik Mitra DUDI & Guru Pembimbing
        $totalCompanies = Company::count();
        $companiesWithStudents = Company::has('users')->count();

        $totalTeachers = User::where('role', 'guru_pembimbing')->count();
        $avgStudentsPerTeacher = $totalTeachers > 0 ? round($assignedTeacherStudents / $totalTeachers, 1) : 0;

        // 3. Metrik Presensi Hari Ini
        $todayAttendances = Attendance::whereDate('date', $today)->count();
        $todayPresent = Attendance::whereDate('date', $today)->where('status', 'hadir')->count();
        $todayLate = Attendance::whereDate('date', $today)->where('status', 'terlambat')->count();
        $todayPermit = Attendance::whereDate('date', $today)->where('status', 'izin')->count();
        $todaySick = Attendance::whereDate('date', $today)->where('status', 'sakit')->count();
        $todayAlpha = Attendance::whereDate('date', $today)->where('status', 'alpa')->count();
        $todayAttendanceRate = $totalStudents > 0 ? round((($todayPresent + $todayLate) / $totalStudents) * 100, 1) : 0;

        // 4. Tren Presensi 7 Hari Terakhir
        $last7Days = collect(range(6, 0))->map(function ($daysAgo) {
            $date = Carbon::today()->subDays($daysAgo);
            $dateStr = $date->toDateString();
            $hadir = Attendance::whereDate('date', $dateStr)->where('status', 'hadir')->count();
            $terlambat = Attendance::whereDate('date', $dateStr)->where('status', 'terlambat')->count();
            $absen = Attendance::whereDate('date', $dateStr)->whereIn('status', ['izin', 'sakit', 'alpa'])->count();

            return [
                'date' => $dateStr,
                'day_name' => $date->isoFormat('dddd'),
                'date_short' => $date->isoFormat('D MMM'),
                'hadir' => $hadir,
                'terlambat' => $terlambat,
                'absen' => $absen,
                'total' => $hadir + $terlambat + $absen,
            ];
        });

        // 5. Aktivitas Presensi & Jurnal Terkini
        $recentAttendances = Attendance::with(['user:id,name,nis_nip,class_name,avatar,slug', 'company:id,name'])
            ->latest()
            ->take(6)
            ->get();

        $recentJournals = DailyJournal::with(['user:id,name,class_name,avatar,slug'])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('admin/dashboard/index', [
            'today_date' => Carbon::now()->isoFormat('dddd, D MMMM Y'),
            'stats' => [
                'students' => [
                    'total' => $totalStudents,
                    'placed' => $placedStudents,
                    'unplaced' => $unplacedStudents,
                    'placement_rate' => $placementRate,
                    'assigned_teachers' => $assignedTeacherStudents,
                    'unassigned_teachers' => $unassignedTeacherStudents,
                ],
                'companies' => [
                    'total' => $totalCompanies,
                    'active' => $companiesWithStudents,
                ],
                'teachers' => [
                    'total' => $totalTeachers,
                    'avg_students' => $avgStudentsPerTeacher,
                ],
                'attendances' => [
                    'today_total' => $todayAttendances,
                    'today_present' => $todayPresent,
                    'today_late' => $todayLate,
                    'today_permit' => $todayPermit,
                    'today_sick' => $todaySick,
                    'today_alpha' => $todayAlpha,
                    'today_rate' => $todayAttendanceRate,
                    'trend_7_days' => $last7Days,
                ],
            ],
            'recent_attendances' => $recentAttendances,
            'recent_journals' => $recentJournals,
        ]);
    }
}
