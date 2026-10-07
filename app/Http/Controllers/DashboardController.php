<?php

namespace App\Http\Controllers;

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
    public function index(Request $request)
    {
        $user = $request->user()->load('company');

        if ($user->role === 'admin') {
            return redirect()->route('admin.students.index');
        }

        if ($user->role === 'guru_pembimbing') {
            return redirect()->route('teacher.attendances.index');
        }

        $today = Carbon::today()->toDateString();

        $data = [
            'user' => $user,
            'today_date' => Carbon::now()->isoFormat('dddd, D MMMM Y'),
            'role' => $user->role,
        ];

        if ($user->role === 'admin') {
            $totalStudents = User::where('role', 'siswa')->count();
            $placedStudents = User::where('role', 'siswa')->whereNotNull('company_id')->count();
            $assignedTeachers = User::where('role', 'siswa')->whereNotNull('mentor_teacher_id')->count();
            $todayAttendances = Attendance::whereDate('date', $today)->count();
            $todayPresent = Attendance::whereDate('date', $today)->whereIn('status', ['hadir', 'terlambat'])->count();
            $todayLate = Attendance::whereDate('date', $today)->where('status', 'terlambat')->count();
            $pendingJournals = DailyJournal::where('status', 'pending')->count();
            $approvedJournals = DailyJournal::where('status', 'approved')->count();

            $prayerLogs = PrayerLog::query();
            $totalPrayers = (clone $prayerLogs)->count();
            $berjamaah = (clone $prayerLogs)->where('status', 'berjamaah')->count();

            $data['stats'] = [
                'total_students' => $totalStudents,
                'placed_students' => $placedStudents,
                'unassigned_students' => $totalStudents - $placedStudents,
                'assigned_teacher_students' => $assignedTeachers,
                'total_companies' => Company::count(),
                'total_teachers' => User::where('role', 'guru_pembimbing')->count(),
                'today_attendances' => $todayAttendances,
                'today_present' => $todayPresent,
                'today_late' => $todayLate,
                'attendance_rate' => $totalStudents > 0 ? round(($todayPresent / $totalStudents) * 100, 1) : 0,
                'pending_journals' => $pendingJournals,
                'approved_journals' => $approvedJournals,
                'berjamaah_rate' => $totalPrayers > 0 ? round(($berjamaah / $totalPrayers) * 100, 1) : 0,
            ];

            $data['recent_attendances'] = Attendance::with(['user', 'company'])
                ->latest()
                ->take(6)
                ->get();

            $data['recent_journals'] = DailyJournal::with(['user.company', 'prayerLogs'])
                ->latest()
                ->take(6)
                ->get();

            $data['companies'] = Company::withCount(['users as students_count' => fn($q) => $q->where('role', 'siswa')])
                ->take(4)
                ->get();
        } elseif ($user->role === 'guru_pembimbing') {
            $guidedStudentsCount = User::where('mentor_teacher_id', $user->id)->count();
            $todayAttendances = Attendance::whereHas('user', fn($q) => $q->where('mentor_teacher_id', $user->id))
                ->whereDate('date', $today)
                ->count();
            $pendingJournals = DailyJournal::whereHas('user', fn($q) => $q->where('mentor_teacher_id', $user->id))
                ->where('status', 'pending')
                ->count();
            $approvedJournals = DailyJournal::whereHas('user', fn($q) => $q->where('mentor_teacher_id', $user->id))
                ->where('status', 'approved')
                ->count();

            $data['stats'] = [
                'guided_students_count' => $guidedStudentsCount,
                'today_attendances' => $todayAttendances,
                'pending_journals' => $pendingJournals,
                'approved_journals' => $approvedJournals,
            ];

            $data['guided_students'] = User::where('mentor_teacher_id', $user->id)
                ->with(['company', 'attendances' => fn($q) => $q->whereDate('date', $today)])
                ->get();

            $data['recent_journals'] = DailyJournal::whereHas('user', fn($q) => $q->where('mentor_teacher_id', $user->id))
                ->with(['user.company', 'prayerLogs', 'attendance'])
                ->latest()
                ->take(6)
                ->get();
        } elseif ($user->role === 'pembimbing_dudi') {
            $companyId = $user->company_id;
            $studentsCount = User::where('role', 'siswa')->where('company_id', $companyId)->count();
            $todayAttendances = Attendance::where('company_id', $companyId)->whereDate('date', $today)->count();
            $pendingJournals = DailyJournal::whereHas('user', fn($q) => $q->where('company_id', $companyId))->where('status', 'pending')->count();
            $approvedJournals = DailyJournal::whereHas('user', fn($q) => $q->where('company_id', $companyId))->where('status', 'approved')->count();

            $data['stats'] = [
                'company_name' => $user->company?->name ?? 'Instansi Belum Diset',
                'students_count' => $studentsCount,
                'today_attendances' => $todayAttendances,
                'pending_journals' => $pendingJournals,
                'approved_journals' => $approvedJournals,
            ];

            $data['students'] = User::where('role', 'siswa')
                ->where('company_id', $companyId)
                ->with(['attendances' => fn($q) => $q->whereDate('date', $today)])
                ->get();

            $data['recent_journals'] = DailyJournal::whereHas('user', fn($q) => $q->where('company_id', $companyId))
                ->with(['user', 'attendance', 'prayerLogs'])
                ->latest()
                ->take(6)
                ->get();
        } else {
            // Siswa
            $user->load(['company', 'mentorTeacher']);

            $todayAttendance = Attendance::where('user_id', $user->id)
                ->whereDate('date', $today)
                ->first();

            $allAttendances = Attendance::where('user_id', $user->id)->get();
            $totalPresensi = $allAttendances->count();
            $totalHadir = $allAttendances->where('status', 'hadir')->count();
            $totalTerlambat = $allAttendances->where('status', 'terlambat')->count();

            $data['stats'] = [
                'has_checked_in' => (bool) $todayAttendance,
                'has_checked_out' => (bool) ($todayAttendance && $todayAttendance->check_out_time !== null),
                'check_in_time' => $todayAttendance?->check_in_time ? substr($todayAttendance->check_in_time, 0, 5) : null,
                'check_out_time' => $todayAttendance?->check_out_time ? substr($todayAttendance->check_out_time, 0, 5) : null,
                'attendance_status' => $todayAttendance?->status,
                'total_hadir' => $totalHadir,
                'total_terlambat' => $totalTerlambat,
                'total_presensi' => $totalPresensi,
                'punctuality_rate' => $totalPresensi > 0 ? round(($totalHadir / $totalPresensi) * 100, 1) : 100,
            ];

            $data['today_attendance'] = $todayAttendance ? [
                'id' => $todayAttendance->id,
                'date' => $todayAttendance->date instanceof Carbon ? $todayAttendance->date->format('Y-m-d') : (string) $todayAttendance->date,
                'check_in_time' => $todayAttendance->check_in_time ? substr($todayAttendance->check_in_time, 0, 5) : null,
                'check_out_time' => $todayAttendance->check_out_time ? substr($todayAttendance->check_out_time, 0, 5) : null,
                'status' => $todayAttendance->status,
                'selfie_url' => $todayAttendance->selfie_path ? asset('storage/' . $todayAttendance->selfie_path) : null,
            ] : null;

            $data['recent_attendances'] = Attendance::where('user_id', $user->id)
                ->latest('date')
                ->take(5)
                ->get()
                ->map(function ($att) {
                    $dateObj = $att->date instanceof Carbon ? $att->date : Carbon::parse($att->date);
                    return [
                        'id' => $att->id,
                        'date_raw' => $dateObj->format('Y-m-d'),
                        'date_formatted' => $dateObj->isoFormat('dddd, D MMMM Y'),
                        'date_short' => $dateObj->isoFormat('D MMM Y'),
                        'day_name' => $dateObj->isoFormat('dddd'),
                        'check_in_time' => $att->check_in_time ? substr($att->check_in_time, 0, 5) : null,
                        'check_out_time' => $att->check_out_time ? substr($att->check_out_time, 0, 5) : null,
                        'status' => $att->status,
                    ];
                });
        }

        return Inertia::render('dashboard', $data);
    }
}
