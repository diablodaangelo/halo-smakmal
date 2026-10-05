<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Services\GeofenceService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    /**
     * Display student's complete attendance history with radius & time details.
     */
    public function index(Request $request): Response
    {
        $user = $request->user()->load('company');
        $company = $user->company;

        $attendances = Attendance::where('user_id', $user->id)
            ->latest('date')
            ->paginate(15)
            ->through(function ($att) use ($company) {
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

                $formattedDate = $att->date instanceof Carbon ? $att->date->isoFormat('dddd, D MMMM Y') : Carbon::parse($att->date)->isoFormat('dddd, D MMMM Y');
                $rawDate = $att->date instanceof Carbon ? $att->date->format('Y-m-d') : (string) $att->date;
                $todayDateStr = Carbon::today()->toDateString();
                $isMissedCheckOut = empty($att->check_out_time) && !empty($att->check_in_time) && ($rawDate < $todayDateStr);

                return [
                    'id' => $att->id,
                    'date' => $rawDate,
                    'date_formatted' => $formattedDate,
                    'check_in_time' => $att->check_in_time ? substr($att->check_in_time, 0, 5) : null,
                    'check_out_time' => $att->check_out_time ? substr($att->check_out_time, 0, 5) : null,
                    'is_missed_checkout' => $isMissedCheckOut,
                    'status' => $att->status,
                    'check_in_lat' => $att->check_in_lat,
                    'check_in_long' => $att->check_in_long,
                    'check_out_lat' => $att->check_out_lat,
                    'check_out_long' => $att->check_out_long,
                    'check_in_distance' => $checkInDistance,
                    'check_out_distance' => $checkOutDistance,
                    'is_in_radius' => $inRadius,
                    'radius_limit' => $company?->radius_meters ?? 100,
                    'selfie_url' => $att->selfie_path ? asset('storage/' . $att->selfie_path) : null,
                ];
            });

        // Calculate summary stats
        $allAttendances = Attendance::where('user_id', $user->id)->get();
        $totalPresensi = $allAttendances->count();
        $totalHadir = $allAttendances->where('status', 'hadir')->count();
        $totalTerlambat = $allAttendances->where('status', 'terlambat')->count();
        $todayDateStr = Carbon::today()->toDateString();
        $totalLupaCheckOut = $allAttendances->filter(function ($a) use ($todayDateStr) {
            $d = $a->date instanceof Carbon ? $a->date->format('Y-m-d') : (string) $a->date;
            return empty($a->check_out_time) && !empty($a->check_in_time) && ($d < $todayDateStr);
        })->count();

        $inRadiusCount = 0;
        $outRadiusCount = 0;
        foreach ($allAttendances as $att) {
            if ($company && $att->check_in_lat && $att->check_in_long) {
                $dist = GeofenceService::calculateDistance(
                    (float) $att->check_in_lat,
                    (float) $att->check_in_long,
                    (float) $company->latitude,
                    (float) $company->longitude
                );
                if ($dist <= $company->radius_meters) {
                    $inRadiusCount++;
                } else {
                    $outRadiusCount++;
                }
            }
        }

        $stats = [
            'total_presensi' => $totalPresensi,
            'total_hadir' => $totalHadir,
            'total_terlambat' => $totalTerlambat,
            'total_lupa_checkout' => $totalLupaCheckOut,
            'in_radius_count' => $inRadiusCount,
            'out_radius_count' => $outRadiusCount,
            'punctuality_rate' => $totalPresensi > 0 ? round(($totalHadir / $totalPresensi) * 100, 1) : 0,
            'radius_compliance_rate' => $totalPresensi > 0 ? round(($inRadiusCount / $totalPresensi) * 100, 1) : 0,
        ];

        return Inertia::render('student/attendances/index', [
            'attendances' => $attendances,
            'stats' => $stats,
            'company' => $company,
        ]);
    }

    /**
     * Handle student GPS & selfie check-in.
     */
    public function checkIn(Request $request): RedirectResponse
    {
        $user = $request->user()->load('company');

        if (! $user->company) {
            return redirect()->back()->withErrors([
                'attendance' => 'Anda belum ditempatkan di instansi / DUDI manapun. Hubungi Admin.',
            ]);
        }

        $validated = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'selfie_image' => 'required|string',
        ]);

        $company = $user->company;
        $now = Carbon::now();
        $today = $now->toDateString();
        $currentTime = $now->format('H:i:s');
        $currentTimeShort = $now->format('H:i');

        // Check duplicate
        $existing = Attendance::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->first();

        if ($existing) {
            return redirect()->back()->withErrors([
                'attendance' => 'Anda sudah melakukan presensi masuk hari ini pada pukul ' . substr($existing->check_in_time, 0, 5) . ' WIB.',
            ]);
        }

        // Calculate GPS distance
        $distance = GeofenceService::calculateDistance(
            (float) $validated['latitude'],
            (float) $validated['longitude'],
            (float) $company->latitude,
            (float) $company->longitude
        );

        $formattedDistance = round($distance);
        $isOutsideRadius = $distance > $company->radius_meters;

        // Determine status (hadir / terlambat)
        $limitTime = substr($company->check_in_end, 0, 5);
        $isLate = $currentTimeShort > $limitTime;
        $status = $isLate ? 'terlambat' : 'hadir';

        // Store selfie image
        $imagePath = $this->saveBase64Image($validated['selfie_image'], 'attendances/checkin');

        Attendance::create([
            'user_id' => $user->id,
            'company_id' => $company->id,
            'date' => $today,
            'check_in_time' => $currentTime,
            'check_in_lat' => $validated['latitude'],
            'check_in_long' => $validated['longitude'],
            'selfie_path' => $imagePath,
            'status' => $status,
        ]);

        // Build informative keterangan message
        $keteranganParts = [];
        if ($isLate) {
            $keteranganParts[] = "Status: Terlambat ({$currentTimeShort} WIB, batas: {$limitTime} WIB)";
        } else {
            $keteranganParts[] = "Tepat Waktu ({$currentTimeShort} WIB)";
        }

        if ($isOutsideRadius) {
            $keteranganParts[] = "Lokasi: Di luar radius ({$formattedDistance}m dari kantor {$company->name}, batas toleransi {$company->radius_meters}m)";
        } else {
            $keteranganParts[] = "Lokasi Sesuai ({$formattedDistance}m)";
        }

        $statusMsg = 'Presensi Masuk Berhasil dicatat! ' . implode(' | ', $keteranganParts);

        return redirect()->back()->with('success', $statusMsg);
    }

    /**
     * Handle student GPS & selfie check-out.
     */
    public function checkOut(Request $request): RedirectResponse
    {
        $user = $request->user()->load('company');

        if (! $user->company) {
            return redirect()->back()->withErrors([
                'attendance' => 'Anda belum terdaftar di DUDI manapun.',
            ]);
        }

        $validated = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'selfie_image' => 'required|string',
        ]);

        $company = $user->company;
        $now = Carbon::now();
        $today = $now->toDateString();
        $currentTime = $now->format('H:i:s');
        $currentTimeShort = $now->format('H:i');

        $attendance = Attendance::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->first();

        if (! $attendance) {
            return redirect()->back()->withErrors([
                'attendance' => 'Anda belum melakukan presensi masuk hari ini.',
            ]);
        }

        if ($attendance->check_out_time !== null) {
            return redirect()->back()->withErrors([
                'attendance' => 'Anda sudah melakukan presensi pulang hari ini pada pukul ' . substr($attendance->check_out_time, 0, 5) . ' WIB.',
            ]);
        }

        // Calculate GPS distance
        $distance = GeofenceService::calculateDistance(
            (float) $validated['latitude'],
            (float) $validated['longitude'],
            (float) $company->latitude,
            (float) $company->longitude
        );

        $formattedDistance = round($distance);
        $isOutsideRadius = $distance > $company->radius_meters;

        // Check early check-out
        $startTime = substr($company->check_out_start, 0, 5);
        $isEarly = $currentTimeShort < $startTime;

        $imagePath = $this->saveBase64Image($validated['selfie_image'], 'attendances/checkout');

        $attendance->update([
            'check_out_time' => $currentTime,
            'check_out_lat' => $validated['latitude'],
            'check_out_long' => $validated['longitude'],
        ]);

        // Build informative message
        $keteranganParts = ["Pukul {$currentTimeShort} WIB"];
        if ($isEarly) {
            $keteranganParts[] = "Pulang lebih awal (jam pulang standar: {$startTime} WIB)";
        }
        if ($isOutsideRadius) {
            $keteranganParts[] = "Di luar radius ({$formattedDistance}m dari kantor)";
        }

        $msg = 'Presensi Pulang Berhasil! ' . implode(' | ', $keteranganParts) . '. Selamat beristirahat!';

        return redirect()->back()->with('success', $msg);
    }

    /**
     * Helper to store base64 image data URL to public storage.
     */
    private function saveBase64Image(string $base64Data, string $folder): string
    {
        if (preg_match('/^data:image\/(\w+);base64,/', $base64Data, $type)) {
            $data = substr($base64Data, strpos($base64Data, ',') + 1);
            $type = strtolower($type[1]);
            $data = base64_decode($data);
            $fileName = $folder . '/' . Str::random(24) . '.' . ($type === 'jpeg' ? 'jpg' : $type);
            Storage::disk('public')->put($fileName, $data);
            return $fileName;
        }

        return $base64Data;
    }
}
