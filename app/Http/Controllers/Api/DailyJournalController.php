<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDailyJournalRequest;
use App\Http\Requests\UpdateDailyJournalRequest;
use App\Models\Attendance;
use App\Models\DailyJournal;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DailyJournalController extends Controller
{
    /**
     * Display a listing of the student's daily journals.
     */
    public function myJournals(Request $request): JsonResponse
    {
        $journals = DailyJournal::query()
            ->where('user_id', $request->user()->id)
            ->when($request->filled('status'), function ($query) use ($request) {
                return $query->where('status', $request->status);
            })
            ->when($request->filled('start_date'), function ($query) use ($request) {
                return $query->whereDate('date', '>=', $request->start_date);
            })
            ->when($request->filled('end_date'), function ($query) use ($request) {
                return $query->whereDate('date', '<=', $request->end_date);
            })
            ->with(['attendance', 'prayerLogs'])
            ->orderBy('date', 'desc')
            ->paginate($request->query('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $journals,
        ]);
    }

    /**
     * Store a newly created daily journal and prayer logs.
     */
    public function store(StoreDailyJournalRequest $request): JsonResponse
    {
        $user = $request->user();
        $today = Carbon::today()->toDateString();

        // 1. Check attendance prerequisite for today
        $attendance = Attendance::where('user_id', $user->id)
            ->where('date', $today)
            ->first();

        if (! $attendance || ! in_array($attendance->status, ['hadir', 'terlambat'], true)) {
            return response()->json([
                'message' => 'Anda harus melakukan presensi kehadiran terlebih dahulu sebelum mengisi jurnal harian.',
            ], 422);
        }

        // 2. Check if journal for today's attendance already exists
        $existingJournal = DailyJournal::where('attendance_id', $attendance->id)->first();
        if ($existingJournal) {
            return response()->json([
                'message' => 'Jurnal harian untuk hari ini sudah pernah dibuat.',
                'data' => $existingJournal,
            ], 422);
        }

        // 3. Upload documentation photo if provided
        $photoPath = null;
        if ($request->hasFile('work_photo')) {
            $file = $request->file('work_photo');
            $filename = 'journal_' . $user->id . '_' . date('Ymd_His') . '.' . $file->getClientOriginalExtension();
            $photoPath = $file->storeAs('journals', $filename, 'public');
        }

        // 4. Wrap journal and prayer logs creation in DB Transaction
        $journal = DB::transaction(function () use ($user, $attendance, $today, $request, $photoPath) {
            $dailyJournal = DailyJournal::create([
                'user_id' => $user->id,
                'attendance_id' => $attendance->id,
                'date' => $today,
                'work_summary' => $request->work_summary,
                'obstacles' => $request->obstacles,
                'work_photo' => $photoPath,
                'status' => 'pending',
                'mentor_notes' => null,
            ]);

            foreach ($request->prayers as $prayerData) {
                $isUdzur = ($prayerData['status'] === 'udzur');
                $dailyJournal->prayerLogs()->create([
                    'prayer_type' => $prayerData['prayer_type'],
                    'prayer_time' => $isUdzur ? null : ($prayerData['prayer_time'] ?? null),
                    'location_name' => $isUdzur ? null : ($prayerData['location_name'] ?? null),
                    'status' => $prayerData['status'],
                ]);
            }

            return $dailyJournal;
        });

        return response()->json([
            'message' => 'Jurnal harian dan log ibadah berhasil disimpan.',
            'data' => $journal->load(['attendance', 'prayerLogs']),
        ], 201);
    }

    /**
     * Display the specified daily journal.
     */
    public function show(Request $request, int|string $id): JsonResponse
    {
        $journal = DailyJournal::with(['attendance', 'prayerLogs'])->findOrFail($id);

        if ($journal->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Akses ditolak. Anda tidak memiliki izin melihat jurnal ini.',
            ], 403);
        }

        return response()->json([
            'data' => $journal,
        ]);
    }

    /**
     * Update the specified daily journal and prayer logs.
     */
    public function update(UpdateDailyJournalRequest $request, int|string $id): JsonResponse
    {
        $journal = DailyJournal::with(['attendance', 'prayerLogs'])->findOrFail($id);

        if ($journal->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Akses ditolak. Anda tidak memiliki izin mengubah jurnal ini.',
            ], 403);
        }

        if ($journal->status === 'approved') {
            return response()->json([
                'message' => 'Jurnal yang telah disetujui tidak dapat diubah.',
            ], 403);
        }

        $photoPath = $journal->work_photo;
        if ($request->hasFile('work_photo')) {
            $file = $request->file('work_photo');
            $filename = 'journal_' . $journal->user_id . '_' . date('Ymd_His') . '.' . $file->getClientOriginalExtension();
            $photoPath = $file->storeAs('journals', $filename, 'public');
        }

        DB::transaction(function () use ($journal, $request, $photoPath) {
            $updateData = [];
            if ($request->has('work_summary')) {
                $updateData['work_summary'] = $request->work_summary;
            }
            if ($request->has('obstacles')) {
                $updateData['obstacles'] = $request->obstacles;
            }
            if ($photoPath !== $journal->work_photo) {
                $updateData['work_photo'] = $photoPath;
            }

            if (! empty($updateData)) {
                $journal->update($updateData);
            }

            if ($request->has('prayers')) {
                $journal->prayerLogs()->delete();
                foreach ($request->prayers as $prayerData) {
                    $isUdzur = ($prayerData['status'] === 'udzur');
                    $journal->prayerLogs()->create([
                        'prayer_type' => $prayerData['prayer_type'],
                        'prayer_time' => $isUdzur ? null : ($prayerData['prayer_time'] ?? null),
                        'location_name' => $isUdzur ? null : ($prayerData['location_name'] ?? null),
                        'status' => $prayerData['status'],
                    ]);
                }
            }
        });

        return response()->json([
            'message' => 'Jurnal harian berhasil diperbarui.',
            'data' => $journal->fresh(['attendance', 'prayerLogs']),
        ]);
    }
}
