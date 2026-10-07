<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentListController extends Controller
{
    /**
     * Display list of guided students for teacher.
     */
    public function index(Request $request): Response
    {
        $teacher = $request->user();
        $search = $request->input('search');
        $today = Carbon::today()->toDateString();

        $query = User::where('role', 'siswa')
            ->where('mentor_teacher_id', $teacher->id)
            ->with(['company'])
            ->withCount([
                'attendances as total_attendances_count',
                'dailyJournals as total_journals_count',
                'prayerLogs as total_prayers_count',
            ]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('nis_nip', 'like', "%{$search}%")
                    ->orWhereHas('company', fn($c) => $c->where('name', 'like', "%{$search}%"));
            });
        }

        $students = $query->orderBy('name')->get()->map(function ($student) use ($today) {
            // Ensure slug
            if (empty($student->slug)) {
                $student->save();
            }

            $todayAtt = Attendance::where('user_id', $student->id)
                ->whereDate('date', $today)
                ->first();

            return [
                'id' => $student->id,
                'name' => $student->name,
                'slug' => $student->slug,
                'nickname' => $student->nickname,
                'nis_nip' => $student->nis_nip,
                'phone' => $student->phone,
                'email' => $student->email,
                'avatar_url' => $student->avatar_url,
                'company' => $student->company ? [
                    'id' => $student->company->id,
                    'name' => $student->company->name,
                    'address' => $student->company->address,
                ] : null,
                'today_attendance' => $todayAtt ? [
                    'status' => $todayAtt->status,
                    'check_in_time' => $todayAtt->check_in_time ? substr($todayAtt->check_in_time, 0, 5) : null,
                    'check_out_time' => $todayAtt->check_out_time ? substr($todayAtt->check_out_time, 0, 5) : null,
                ] : null,
                'stats' => [
                    'total_attendances' => (int) $student->total_attendances_count,
                    'total_journals' => (int) $student->total_journals_count,
                    'total_prayers' => (int) $student->total_prayers_count,
                ],
            ];
        });

        // Summary counts
        $totalStudents = $students->count();
        $todayPresentCount = $students->filter(fn($s) => !empty($s['today_attendance']) && in_array($s['today_attendance']['status'], ['hadir', 'terlambat']))->count();
        $todayLateCount = $students->filter(fn($s) => !empty($s['today_attendance']) && $s['today_attendance']['status'] === 'terlambat')->count();

        return Inertia::render('teacher/students/index', [
            'students' => $students,
            'stats' => [
                'total_students' => $totalStudents,
                'today_present' => $todayPresentCount,
                'today_late' => $todayLateCount,
            ],
            'filters' => [
                'search' => $search,
            ],
        ]);
    }
}
