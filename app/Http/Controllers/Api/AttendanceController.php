<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckInRequest;
use App\Http\Requests\CheckOutRequest;
use App\Models\Attendance;
use App\Services\GeofenceService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    /**
     * Handle student check-in with geofence validation and selfie upload.
     */
    public function checkIn(CheckInRequest $request): JsonResponse
    {
        $user = $request->user()->load('company');

        if (! $user->company_id || ! $user->company) {
            return response()->json([
                'message' => 'Siswa belum terdaftar di DUDI manapun',
            ], 400);
        }

        $today = Carbon::today()->toDateString();

        // 1. Check duplicate check-in today
        $existing = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Anda sudah melakukan presensi hari ini',
                'data' => $existing,
            ], 422);
        }

        // 2. Validate Geofence radius using Haversine
        $distance = GeofenceService::calculateDistance(
            (float) $request->latitude,
            (float) $request->longitude,
            (float) $user->company->latitude,
            (float) $user->company->longitude
        );

        if ($distance > $user->company->radius_meters) {
            return response()->json([
                'message' => sprintf(
                    'Di luar radius presensi kantor DUDI (Jarak Anda: %d meter, Maksimal: %d meter)',
                    round($distance),
                    $user->company->radius_meters
                ),
                'distance' => round($distance, 2),
                'max_radius' => $user->company->radius_meters,
            ], 422);
        }

        // 3. Determine status (hadir vs terlambat)
        $currentTime = Carbon::now()->format('H:i:s');
        $status = ($currentTime <= $user->company->check_in_end) ? 'hadir' : 'terlambat';

        // 4. Upload selfie image
        $file = $request->file('selfie_image');
        $filename = 'selfie_' . $user->id . '_' . date('Ymd_His') . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('attendances', $filename, 'public');

        // 5. Create attendance record
        $attendance = Attendance::create([
            'user_id' => $user->id,
            'company_id' => $user->company_id,
            'date' => $today,
            'check_in_time' => $currentTime,
            'check_in_lat' => $request->latitude,
            'check_in_long' => $request->longitude,
            'selfie_path' => $path,
            'status' => $status,
        ]);

        return response()->json([
            'message' => 'Presensi masuk berhasil dicatat',
            'status_kehadiran' => $status,
            'distance_meters' => round($distance, 2),
            'data' => $attendance,
        ], 201);
    }

    /**
     * Handle student check-out with geofence and time validation.
     */
    public function checkOut(CheckOutRequest $request): JsonResponse
    {
        $user = $request->user()->load('company');

        if (! $user->company_id || ! $user->company) {
            return response()->json([
                'message' => 'Siswa belum terdaftar di DUDI manapun',
            ], 400);
        }

        $today = Carbon::today()->toDateString();

        // 1. Ensure user has checked in today
        $attendance = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        if (! $attendance) {
            return response()->json([
                'message' => 'Anda belum melakukan check-in hari ini',
            ], 422);
        }

        // 2. Ensure user has not checked out yet
        if ($attendance->check_out_time !== null) {
            return response()->json([
                'message' => 'Anda sudah melakukan check-out hari ini',
                'data' => $attendance,
            ], 422);
        }

        // 3. Validate checkout operational hours
        $currentTime = Carbon::now()->format('H:i:s');
        if ($currentTime < $user->company->check_out_start) {
            return response()->json([
                'message' => 'Belum memasuki waktu check-out kantor',
                'check_out_start' => $user->company->check_out_start,
                'current_time' => $currentTime,
            ], 422);
        }

        // 4. Validate Geofence radius
        $distance = GeofenceService::calculateDistance(
            (float) $request->latitude,
            (float) $request->longitude,
            (float) $user->company->latitude,
            (float) $user->company->longitude
        );

        if ($distance > $user->company->radius_meters) {
            return response()->json([
                'message' => sprintf(
                    'Di luar radius presensi kantor DUDI (Jarak Anda: %d meter, Maksimal: %d meter)',
                    round($distance),
                    $user->company->radius_meters
                ),
                'distance' => round($distance, 2),
                'max_radius' => $user->company->radius_meters,
            ], 422);
        }

        // 5. Update attendance record
        $attendance->update([
            'check_out_time' => $currentTime,
            'check_out_lat' => $request->latitude,
            'check_out_long' => $request->longitude,
        ]);

        return response()->json([
            'message' => 'Presensi pulang berhasil dicatat',
            'distance_meters' => round($distance, 2),
            'data' => $attendance,
        ]);
    }

    /**
     * Get attendance status for today.
     */
    public function todayStatus(Request $request): JsonResponse
    {
        $user = $request->user()->load('company');
        $today = Carbon::today()->toDateString();

        $attendance = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        return response()->json([
            'date' => $today,
            'company' => $user->company,
            'attendance' => $attendance,
            'has_checked_in' => (bool) $attendance,
            'has_checked_out' => (bool) ($attendance && $attendance->check_out_time !== null),
        ]);
    }

    /**
     * Get attendance history with pagination and date filter.
     */
    public function history(Request $request): JsonResponse
    {
        $attendances = Attendance::query()
            ->where('user_id', $request->user()->id)
            ->when($request->filled('month'), function ($query) use ($request) {
                return $query->whereMonth('date', $request->month);
            })
            ->when($request->filled('year'), function ($query) use ($request) {
                return $query->whereYear('date', $request->year);
            })
            ->orderBy('date', 'desc')
            ->paginate($request->query('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $attendances,
        ]);
    }
}
