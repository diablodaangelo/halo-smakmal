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

class AttendanceController extends Controller
{
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
