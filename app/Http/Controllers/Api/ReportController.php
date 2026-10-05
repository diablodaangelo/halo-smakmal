<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\DailyJournal;
use App\Models\PrayerLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Get attendance summary report and aggregate statistics.
     */
    public function attendanceSummary(Request $request): JsonResponse
    {
        $baseQuery = Attendance::query()
            ->when($request->filled('company_id'), function ($query) use ($request) {
                return $query->where('company_id', $request->company_id);
            })
            ->when($request->filled('student_id'), function ($query) use ($request) {
                return $query->where('user_id', $request->student_id);
            })
            ->when($request->filled('start_date'), function ($query) use ($request) {
                return $query->whereDate('date', '>=', $request->start_date);
            })
            ->when($request->filled('end_date'), function ($query) use ($request) {
                return $query->whereDate('date', '<=', $request->end_date);
            });

        // Calculate statistics
        $totalRecords = (clone $baseQuery)->count();
        $hadir = (clone $baseQuery)->where('status', 'hadir')->count();
        $terlambat = (clone $baseQuery)->where('status', 'terlambat')->count();
        $izin = (clone $baseQuery)->where('status', 'izin')->count();
        $sakit = (clone $baseQuery)->where('status', 'sakit')->count();
        $alpa = (clone $baseQuery)->where('status', 'alpa')->count();

        $attendances = (clone $baseQuery)
            ->with(['user', 'company'])
            ->orderBy('date', 'desc')
            ->paginate($request->query('per_page', 20));

        return response()->json([
            'status' => 'success',
            'summary' => [
                'total_presensi' => $totalRecords,
                'total_hadir' => $hadir,
                'total_terlambat' => $terlambat,
                'total_izin' => $izin,
                'total_sakit' => $sakit,
                'total_alpa' => $alpa,
                'persentase_kehadiran' => $totalRecords > 0 ? round((($hadir + $terlambat) / $totalRecords) * 100, 2) : 0,
            ],
            'data' => $attendances,
        ]);
    }

    /**
     * Get daily journal recap report with prayer compliance statistics.
     */
    public function journalRecap(Request $request): JsonResponse
    {
        $baseQuery = DailyJournal::query()
            ->when($request->filled('company_id'), function ($query) use ($request) {
                return $query->whereHas('user', function ($q) use ($request) {
                    $q->where('company_id', $request->company_id);
                });
            })
            ->when($request->filled('student_id'), function ($query) use ($request) {
                return $query->where('user_id', $request->student_id);
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                return $query->where('status', $request->status);
            })
            ->when($request->filled('start_date'), function ($query) use ($request) {
                return $query->whereDate('date', '>=', $request->start_date);
            })
            ->when($request->filled('end_date'), function ($query) use ($request) {
                return $query->whereDate('date', '<=', $request->end_date);
            });

        $journalIds = (clone $baseQuery)->pluck('id');

        // Prayer stats calculation
        $prayerLogs = PrayerLog::whereIn('daily_journal_id', $journalIds);
        $totalPrayers = (clone $prayerLogs)->count();
        $berjamaah = (clone $prayerLogs)->where('status', 'berjamaah')->count();
        $munfarid = (clone $prayerLogs)->where('status', 'munfarid')->count();
        $udzur = (clone $prayerLogs)->where('status', 'udzur')->count();

        // Journal status counts
        $totalJournals = (clone $baseQuery)->count();
        $approvedJournals = (clone $baseQuery)->where('status', 'approved')->count();
        $pendingJournals = (clone $baseQuery)->where('status', 'pending')->count();
        $revisionJournals = (clone $baseQuery)->where('status', 'revision')->count();

        $journals = (clone $baseQuery)
            ->with(['user.company', 'attendance', 'prayerLogs'])
            ->orderBy('date', 'desc')
            ->paginate($request->query('per_page', 20));

        return response()->json([
            'status' => 'success',
            'summary' => [
                'total_jurnal' => $totalJournals,
                'jurnal_approved' => $approvedJournals,
                'jurnal_pending' => $pendingJournals,
                'jurnal_revision' => $revisionJournals,
                'ibadah_compliance' => [
                    'total_log_salat' => $totalPrayers,
                    'total_berjamaah' => $berjamaah,
                    'total_munfarid' => $munfarid,
                    'total_udzur' => $udzur,
                    'persentase_berjamaah' => $totalPrayers > 0 ? round(($berjamaah / $totalPrayers) * 100, 2) : 0,
                    'persentase_munfarid' => $totalPrayers > 0 ? round(($munfarid / $totalPrayers) * 100, 2) : 0,
                    'persentase_udzur' => $totalPrayers > 0 ? round(($udzur / $totalPrayers) * 100, 2) : 0,
                ],
            ],
            'data' => $journals,
        ]);
    }
}
