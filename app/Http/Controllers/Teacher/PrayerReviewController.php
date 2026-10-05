<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\PrayerLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PrayerReviewController extends Controller
{
    /**
     * Display prayer logs of students guided by the teacher.
     */
    public function index(Request $request): Response
    {
        $teacher = $request->user();
        $studentId = $request->input('student_id');
        $prayerType = $request->input('prayer_type');

        // Fetch all students guided by this teacher
        $students = User::where('mentor_teacher_id', $teacher->id)
            ->where('role', 'siswa')
            ->with('company')
            ->withCount([
                'prayerLogs as total_prayers_count',
            ])
            ->orderBy('name')
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'nis_nip' => $student->nis_nip,
                    'phone' => $student->phone,
                    'company' => $student->company ? [
                        'id' => $student->company->id,
                        'name' => $student->company->name,
                    ] : null,
                    'stats' => [
                        'total_prayers' => (int) $student->total_prayers_count,
                    ],
                ];
            });

        $query = PrayerLog::whereHas('user', function ($q) use ($teacher) {
            $q->where('mentor_teacher_id', $teacher->id);
        })->with(['user.company']);

        if ($studentId) {
            $query->where('user_id', $studentId);
        }

        if ($prayerType && in_array($prayerType, ['dzuhur', 'ashar'])) {
            $query->where('prayer_type', $prayerType);
        }

        $prayerLogs = $query->latest('date')->latest('created_at')->paginate(25)->through(function ($log) {
            return [
                'id' => $log->id,
                'user_id' => $log->user_id,
                'user' => [
                    'id' => $log->user?->id,
                    'name' => $log->user?->name,
                    'nis_nip' => $log->user?->nis_nip,
                    'company_name' => $log->user?->company?->name ?? 'Belum Diplot',
                ],
                'date' => $log->date instanceof Carbon ? $log->date->format('Y-m-d') : (string) $log->date,
                'date_formatted' => $log->date instanceof Carbon ? $log->date->isoFormat('dddd, D MMMM Y') : Carbon::parse($log->date)->isoFormat('dddd, D MMMM Y'),
                'prayer_type' => $log->prayer_type,
                'prayer_time' => $log->prayer_time ? substr($log->prayer_time, 0, 5) : null,
                'status' => $log->status,
                'location_name' => $log->location_name,
                'created_at' => $log->created_at->diffForHumans(),
            ];
        });

        // Summary stats
        $allLogsQuery = PrayerLog::whereHas('user', fn($q) => $q->where('mentor_teacher_id', $teacher->id));
        if ($studentId) {
            $allLogsQuery->where('user_id', $studentId);
        }

        $allLogs = $allLogsQuery->get();
        $totalLogs = $allLogs->count();
        $berjamaahCount = $allLogs->where('status', 'berjamaah')->count();
        $munfaridCount = $allLogs->where('status', 'munfarid')->count();
        $udzurCount = $allLogs->where('status', 'udzur')->count();

        $stats = [
            'total_students' => $students->count(),
            'total_logs' => $totalLogs,
            'berjamaah' => $berjamaahCount,
            'munfarid' => $munfaridCount,
            'udzur' => $udzurCount,
            'discipline_rate' => $totalLogs > 0 ? round(($berjamaahCount / $totalLogs) * 100, 1) : 0,
        ];

        return Inertia::render('teacher/prayers/index', [
            'students' => $students,
            'prayerLogs' => $prayerLogs,
            'stats' => $stats,
            'filters' => [
                'student_id' => $studentId ? (int) $studentId : null,
                'prayer_type' => $prayerType,
            ],
        ]);
    }
}
