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

class SuspiciousController extends Controller
{
    /**
     * Display suspicious attendance anomalies for guided students.
     */
    public function index(Request $request): Response
    {
        $teacher = $request->user();
        $today = Carbon::today()->toDateString();
        $filterCategory = $request->input('category', 'all');
        $studentId = $request->input('student_id');
        $date = $request->input('date');

        $students = User::where('mentor_teacher_id', $teacher->id)
            ->with('company')
            ->orderBy('name')
            ->get();

        $query = Attendance::whereHas('user', function ($q) use ($teacher) {
            $q->where('mentor_teacher_id', $teacher->id);
        })->with(['user.company', 'company']);

        if ($studentId) {
            $query->where('user_id', $studentId);
        }

        if ($date) {
            $query->whereDate('date', $date);
        }

        $allRecords = $query->latest('date')->latest('check_in_time')->get();

        $anomalies = [];
        $outRadiusCount = 0;
        $lateCount = 0;
        $earlyCheckoutCount = 0;

        foreach ($allRecords as $att) {
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

            $isLate = $att->status === 'terlambat';
            $isOutsideRadius = !$inRadius;
            
            $isEarlyCheckout = false;
            if ($company && $att->check_out_time) {
                $startTime = substr($company->check_out_start, 0, 5);
                $checkOutShort = substr($att->check_out_time, 0, 5);
                if ($checkOutShort < $startTime) {
                    $isEarlyCheckout = true;
                }
            }

            if ($isOutsideRadius) {
                $outRadiusCount++;
            }
            if ($isLate) {
                $lateCount++;
            }
            if ($isEarlyCheckout) {
                $earlyCheckoutCount++;
            }

            // Anomaly flags
            $anomalyReasons = [];
            if ($isOutsideRadius) {
                $anomalyReasons[] = [
                    'type' => 'outside_radius',
                    'title' => 'Di Luar Radius Kantor',
                    'description' => "Posisi presensi berjarak {$checkInDistance} meter dari kantor (Batas toleransi: {$company->radius_meters}m).",
                    'severity' => 'danger',
                ];
            }
            if ($isLate) {
                $limit = $company ? substr($company->check_in_end, 0, 5) : '08:00';
                $checkInShort = $att->check_in_time ? substr($att->check_in_time, 0, 5) : '-';
                $anomalyReasons[] = [
                    'type' => 'late',
                    'title' => 'Terlambat Masuk',
                    'description' => "Presensi masuk pukul {$checkInShort} WIB (Batas jam masuk kantor: {$limit} WIB).",
                    'severity' => 'warning',
                ];
            }
            if ($isEarlyCheckout) {
                $start = $company ? substr($company->check_out_start, 0, 5) : '16:00';
                $checkOutShort = substr($att->check_out_time, 0, 5);
                $anomalyReasons[] = [
                    'type' => 'early_checkout',
                    'title' => 'Pulang Lebih Awal',
                    'description' => "Presensi pulang pukul {$checkOutShort} WIB (Jam pulang normal: {$start} WIB).",
                    'severity' => 'warning',
                ];
            }

            // If has any anomaly, include in candidates
            if (!empty($anomalyReasons)) {
                $match = false;
                if ($filterCategory === 'all') {
                    $match = true;
                } elseif ($filterCategory === 'outside_radius' && $isOutsideRadius) {
                    $match = true;
                } elseif ($filterCategory === 'late' && $isLate) {
                    $match = true;
                } elseif ($filterCategory === 'early_checkout' && $isEarlyCheckout) {
                    $match = true;
                }

                if ($match) {
                    $anomalies[] = [
                        'id' => $att->id,
                        'user' => [
                            'id' => $att->user?->id,
                            'name' => $att->user?->name,
                            'nis_nip' => $att->user?->nis_nip,
                            'phone' => $att->user?->phone,
                            'company_name' => $company?->name ?? 'Belum Diplot',
                        ],
                        'date' => $att->date instanceof Carbon ? $att->date->format('Y-m-d') : (string) $att->date,
                        'date_formatted' => $att->date instanceof Carbon ? $att->date->isoFormat('dddd, D MMMM Y') : Carbon::parse($att->date)->isoFormat('dddd, D MMMM Y'),
                        'check_in_time' => $att->check_in_time ? substr($att->check_in_time, 0, 5) : null,
                        'check_out_time' => $att->check_out_time ? substr($att->check_out_time, 0, 5) : null,
                        'check_in_lat' => $att->check_in_lat,
                        'check_in_long' => $att->check_in_long,
                        'check_in_distance' => $checkInDistance,
                        'radius_limit' => $company?->radius_meters ?? 100,
                        'is_in_radius' => $inRadius,
                        'is_late' => $isLate,
                        'is_early_checkout' => $isEarlyCheckout,
                        'selfie_url' => $att->selfie_path ? asset('storage/' . $att->selfie_path) : null,
                        'anomaly_reasons' => $anomalyReasons,
                    ];
                }
            }
        }

        // Check absent students today
        $todayAttendedUserIds = Attendance::whereHas('user', fn($q) => $q->where('mentor_teacher_id', $teacher->id))
            ->whereDate('date', $today)
            ->pluck('user_id')
            ->toArray();

        $absentStudentsToday = [];
        foreach ($students as $stu) {
            if (!in_array($stu->id, $todayAttendedUserIds)) {
                $absentStudentsToday[] = [
                    'id' => $stu->id,
                    'name' => $stu->name,
                    'nis_nip' => $stu->nis_nip,
                    'phone' => $stu->phone,
                    'company_name' => $stu->company?->name ?? 'Belum Diplot',
                ];
            }
        }

        $stats = [
            'total_anomalies' => count($anomalies),
            'outside_radius_count' => $outRadiusCount,
            'late_count' => $lateCount,
            'early_checkout_count' => $earlyCheckoutCount,
            'absent_today_count' => count($absentStudentsToday),
        ];

        return Inertia::render('teacher/suspicious/index', [
            'anomalies' => $anomalies,
            'absentStudentsToday' => $absentStudentsToday,
            'students' => $students,
            'stats' => $stats,
            'filters' => [
                'category' => $filterCategory,
                'student_id' => $studentId,
                'date' => $date,
            ],
            'today_date' => Carbon::now()->isoFormat('dddd, D MMMM Y'),
        ]);
    }
}
