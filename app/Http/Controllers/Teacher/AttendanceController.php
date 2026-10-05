<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\User;
use App\Services\GeofenceService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    /**
     * Display list of guided students' attendances in student-centric logbook format.
     */
    public function index(Request $request): Response
    {
        $teacher = $request->user();
        $studentId = $request->input('student_id');
        $date = $request->input('date');
        $status = $request->input('status');

        // Load guided students with detailed attendance stats
        $students = User::where('mentor_teacher_id', $teacher->id)
            ->where('role', 'siswa')
            ->with('company')
            ->withCount([
                'attendances as total_attendances_count',
                'attendances as hadir_count' => fn($q) => $q->where('status', 'hadir'),
                'attendances as terlambat_count' => fn($q) => $q->where('status', 'terlambat'),
                'attendances as izin_count' => fn($q) => $q->where('status', 'izin'),
                'attendances as sakit_count' => fn($q) => $q->where('status', 'sakit'),
                'attendances as alpa_count' => fn($q) => $q->where('status', 'alpa'),
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
                        'address' => $student->company->address,
                        'radius_meters' => $student->company->radius_meters,
                    ] : null,
                    'stats' => [
                        'total_attendances' => (int) $student->total_attendances_count,
                        'hadir' => (int) $student->hadir_count,
                        'terlambat' => (int) $student->terlambat_count,
                        'izin' => (int) $student->izin_count,
                        'sakit' => (int) $student->sakit_count,
                        'alpa' => (int) $student->alpa_count,
                    ],
                ];
            });

        // Calculate chronological day map (Hari ke-1, Hari ke-2, dst) per student
        $allAttendances = Attendance::whereHas('user', fn($q) => $q->where('mentor_teacher_id', $teacher->id))
            ->orderBy('date', 'asc')
            ->get(['id', 'user_id', 'date']);

        $studentDayCounters = [];
        $dayMap = [];
        foreach ($allAttendances as $att) {
            $uId = $att->user_id;
            if (!isset($studentDayCounters[$uId])) {
                $studentDayCounters[$uId] = 0;
            }
            $studentDayCounters[$uId]++;
            $dayMap[$att->id] = $studentDayCounters[$uId];
        }

        $query = Attendance::whereHas('user', function ($q) use ($teacher) {
            $q->where('mentor_teacher_id', $teacher->id);
        })->with(['user.company', 'company']);

        if ($studentId) {
            $query->where('user_id', $studentId);
        }

        if ($date) {
            $query->whereDate('date', $date);
        }

        if ($status) {
            $query->where('status', $status);
        }

        $orderDir = $studentId ? 'asc' : 'desc';
        $attendances = $query->orderBy('date', $orderDir)->orderBy('check_in_time', $orderDir)->paginate(25)->through(function ($att) use ($dayMap) {
            $company = $att->user?->company ?? $att->company;
            $inRadius = true;
            $checkInDistance = null;
            $checkOutDistance = null;

            if ($company && $att->check_in_lat && $att->check_in_long) {
                $checkInDistance = round(GeofenceService::calculateDistance(
                    (float) $att->check_in_lat,
                    (float) $att->check_in_long,
                    (float) $company->latitude,
                    (float) $company->longitude
                ));
                $inRadius = $checkInDistance <= $company->radius_meters;
            }

            if ($company && $att->check_out_lat && $att->check_out_long) {
                $checkOutDistance = round(GeofenceService::calculateDistance(
                    (float) $att->check_out_lat,
                    (float) $att->check_out_long,
                    (float) $company->latitude,
                    (float) $company->longitude
                ));
            }

            $rawDate = $att->date instanceof Carbon ? $att->date->format('Y-m-d') : (string) $att->date;
            $todayDateStr = Carbon::today()->toDateString();
            $isMissedCheckOut = empty($att->check_out_time) && !empty($att->check_in_time) && ($rawDate < $todayDateStr);

            return [
                'id' => $att->id,
                'user_id' => $att->user_id,
                'day_number' => $dayMap[$att->id] ?? 1,
                'user' => [
                    'id' => $att->user?->id,
                    'name' => $att->user?->name,
                    'nis_nip' => $att->user?->nis_nip,
                    'phone' => $att->user?->phone,
                    'company_name' => $company?->name ?? 'Belum Diplot',
                ],
                'date' => $rawDate,
                'date_formatted' => $att->date instanceof Carbon ? $att->date->isoFormat('dddd, D MMMM Y') : Carbon::parse($att->date)->isoFormat('dddd, D MMMM Y'),
                'check_in_time' => $att->check_in_time ? substr($att->check_in_time, 0, 5) : null,
                'check_out_time' => $att->check_out_time ? substr($att->check_out_time, 0, 5) : null,
                'is_missed_checkout' => $isMissedCheckOut,
                'status' => $att->status,
                'check_in_lat' => $att->check_in_lat,
                'check_in_long' => $att->check_in_long,
                'check_in_distance' => $checkInDistance,
                'check_out_distance' => $checkOutDistance,
                'is_in_radius' => $inRadius,
                'radius_limit' => $company?->radius_meters ?? 100,
                'selfie_url' => $att->selfie_path ? asset('storage/' . $att->selfie_path) : null,
            ];
        });

        // Summary Stats Today
        $today = Carbon::today()->toDateString();
        $totalStudents = $students->count();
        $todayAttendances = Attendance::whereHas('user', fn($q) => $q->where('mentor_teacher_id', $teacher->id))
            ->whereDate('date', $today)
            ->with('user.company')
            ->get();

        $todayPresent = $todayAttendances->whereIn('status', ['hadir', 'terlambat'])->count();
        $todayLate = $todayAttendances->where('status', 'terlambat')->count();

        $stats = [
            'total_students' => $totalStudents,
            'today_present' => $todayPresent,
            'today_late' => $todayLate,
            'today_absent' => max(0, $totalStudents - $todayPresent),
        ];

        return Inertia::render('teacher/attendances/index', [
            'attendances' => $attendances,
            'students' => $students,
            'stats' => $stats,
            'filters' => [
                'student_id' => $studentId ? (int) $studentId : null,
                'date' => $date,
                'status' => $status,
            ],
            'today_date' => Carbon::now()->isoFormat('dddd, D MMMM Y'),
        ]);
    }
}
