<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\PrayerLog;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PrayerController extends Controller
{
    /**
     * Display prayer schedule and prayer log recording interface.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $today = Carbon::today()->toDateString();

        $todayPrayers = PrayerLog::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->get()
            ->keyBy('prayer_type');

        $prayerHistory = PrayerLog::where('user_id', $user->id)
            ->latest('date')
            ->paginate(15);

        $totalLogs = PrayerLog::where('user_id', $user->id)->count();
        $berjamaahCount = PrayerLog::where('user_id', $user->id)->where('status', 'berjamaah')->count();
        $munfaridCount = PrayerLog::where('user_id', $user->id)->where('status', 'munfarid')->count();
        $udzurCount = PrayerLog::where('user_id', $user->id)->where('status', 'udzur')->count();

        $stats = [
            'total_logs' => $totalLogs,
            'berjamaah' => $berjamaahCount,
            'munfarid' => $munfaridCount,
            'udzur' => $udzurCount,
            'discipline_rate' => $totalLogs > 0 ? round(($berjamaahCount / $totalLogs) * 100, 1) : 0,
        ];

        // Estimated prayer times for Ciawi / Bogor
        $prayerSchedule = [
            'dzuhur' => '12:02',
            'ashar' => '15:15',
        ];

        return Inertia::render('student/prayers/index', [
            'todayPrayers' => $todayPrayers,
            'prayerHistory' => $prayerHistory,
            'stats' => $stats,
            'schedule' => $prayerSchedule,
            'today_date' => Carbon::now()->isoFormat('dddd, D MMMM Y'),
        ]);
    }

    /**
     * Record or update prayer log for today.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $today = Carbon::today()->toDateString();

        $validated = $request->validate([
            'prayer_name' => 'required|in:dzuhur,ashar',
            'status' => 'required|in:berjamaah,munfarid,udzur',
            'prayer_time' => 'required_unless:status,udzur|nullable|date_format:H:i',
            'location_name' => 'required_unless:status,udzur|nullable|string|max:255',
        ], [
            'prayer_time.required_unless' => 'Waktu salat wajib diisi untuk pelaksanaan berjamaah atau munfarid.',
            'location_name.required_unless' => 'Nama lokasi/tempat salat wajib diisi.',
        ]);

        PrayerLog::updateOrCreate(
            [
                'user_id' => $user->id,
                'date' => $today,
                'prayer_type' => $validated['prayer_name'],
            ],
            [
                'status' => $validated['status'],
                'prayer_time' => $validated['status'] === 'udzur' ? null : $validated['prayer_time'],
                'location_name' => $validated['status'] === 'udzur' ? null : $validated['location_name'],
            ]
        );

        $prayerTitle = ucfirst($validated['prayer_name']);
        return redirect()->back()->with('success', "Log salat {$prayerTitle} berhasil dicatat.");
    }
}
