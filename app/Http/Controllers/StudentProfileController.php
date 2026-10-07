<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\DailyJournal;
use App\Models\PrayerLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentProfileController extends Controller
{
    /**
     * Display student public/detail profile by slug or ID.
     */
    public function show(Request $request, string $slug): Response
    {
        $student = User::where('role', 'siswa')
            ->where(function ($query) use ($slug) {
                $query->where('slug', $slug)
                    ->orWhere('id', $slug);
            })
            ->with(['company', 'mentorTeacher'])
            ->firstOrFail();

        // Ensure slug exists
        if (empty($student->slug)) {
            $student->save();
        }

        $today = Carbon::today()->toDateString();

        // Today Attendance
        $todayAtt = Attendance::where('user_id', $student->id)
            ->whereDate('date', $today)
            ->first();

        // Attendance stats
        $attendancesQuery = Attendance::where('user_id', $student->id);
        $totalAttendances = (clone $attendancesQuery)->count();
        $hadirCount = (clone $attendancesQuery)->where('status', 'hadir')->count();
        $terlambatCount = (clone $attendancesQuery)->where('status', 'terlambat')->count();
        $izinCount = (clone $attendancesQuery)->where('status', 'izin')->count();
        $sakitCount = (clone $attendancesQuery)->where('status', 'sakit')->count();
        $alpaCount = (clone $attendancesQuery)->where('status', 'alpa')->count();

        // Recent 5 attendances
        $recentAttendances = Attendance::where('user_id', $student->id)
            ->orderBy('date', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($att) {
                return [
                    'id' => $att->id,
                    'date' => $att->date instanceof Carbon ? $att->date->format('Y-m-d') : (string) $att->date,
                    'date_formatted' => $att->date instanceof Carbon ? $att->date->isoFormat('dddd, D MMMM Y') : Carbon::parse($att->date)->isoFormat('dddd, D MMMM Y'),
                    'check_in_time' => $att->check_in_time ? substr($att->check_in_time, 0, 5) : null,
                    'check_out_time' => $att->check_out_time ? substr($att->check_out_time, 0, 5) : null,
                    'status' => $att->status,
                    'selfie_url' => $att->selfie_path ? asset('storage/' . $att->selfie_path) : null,
                ];
            });

        // Journal stats & recent journals
        $journalsQuery = DailyJournal::where('user_id', $student->id);
        $totalJournals = (clone $journalsQuery)->count();
        $recentJournals = DailyJournal::where('user_id', $student->id)
            ->orderBy('day_number', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($j) {
                return [
                    'id' => $j->id,
                    'day_number' => (int) ($j->day_number ?: 1),
                    'work_summary' => $j->work_summary,
                    'obstacles' => $j->obstacles,
                    'work_photo_url' => $j->work_photo ? asset('storage/' . $j->work_photo) : null,
                    'mentor_notes' => $j->mentor_notes,
                ];
            });

        // Prayer stats
        $totalPrayers = PrayerLog::where('user_id', $student->id)->count();

        $studentData = [
            'id' => $student->id,
            'name' => $student->name,
            'slug' => $student->slug,
            'nickname' => $student->nickname,
            'nis_nip' => $student->nis_nip,
            'email' => $student->email,
            'phone' => $student->phone,
            'avatar_url' => $student->avatar_url,
            'role' => $student->role,
            'company' => $student->company ? [
                'id' => $student->company->id,
                'name' => $student->company->name,
                'address' => $student->company->address,
                'radius_meters' => $student->company->radius_meters,
                'check_in_start' => $student->company->check_in_start ? substr($student->company->check_in_start, 0, 5) : '08:00',
                'check_in_end' => $student->company->check_in_end ? substr($student->company->check_in_end, 0, 5) : '08:00',
                'check_out_start' => $student->company->check_out_start ? substr($student->company->check_out_start, 0, 5) : '17:00',
            ] : null,
            'mentor_teacher' => $student->mentorTeacher ? [
                'id' => $student->mentorTeacher->id,
                'name' => $student->mentorTeacher->name,
                'slug' => $student->mentorTeacher->slug,
                'nis_nip' => $student->mentorTeacher->nis_nip,
                'phone' => $student->mentorTeacher->phone,
                'email' => $student->mentorTeacher->email,
            ] : null,
            'today_attendance' => $todayAtt ? [
                'status' => $todayAtt->status,
                'check_in_time' => $todayAtt->check_in_time ? substr($todayAtt->check_in_time, 0, 5) : null,
                'check_out_time' => $todayAtt->check_out_time ? substr($todayAtt->check_out_time, 0, 5) : null,
            ] : null,
            'stats' => [
                'total_attendances' => $totalAttendances,
                'hadir' => $hadirCount,
                'terlambat' => $terlambatCount,
                'izin' => $izinCount,
                'sakit' => $sakitCount,
                'alpa' => $alpaCount,
                'total_journals' => $totalJournals,
                'total_prayers' => $totalPrayers,
            ],
            'recent_attendances' => $recentAttendances,
            'recent_journals' => $recentJournals,
        ];

        return Inertia::render('student/profile', [
            'student' => $studentData,
        ]);
    }
}
