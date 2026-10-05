<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\DailyJournal;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class JournalController extends Controller
{
    /**
     * Display student's daily journals and submission interface.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $today = Carbon::today()->toDateString();

        $journals = DailyJournal::where('user_id', $user->id)
            ->with(['attendance:id,date,check_in_time,check_out_time,status'])
            ->latest('date')
            ->paginate(10);

        $todayAttendance = Attendance::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->first();

        $todayJournal = DailyJournal::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->first();

        $stats = [
            'total' => DailyJournal::where('user_id', $user->id)->count(),
            'approved' => DailyJournal::where('user_id', $user->id)->where('status', 'approved')->count(),
            'revision' => DailyJournal::where('user_id', $user->id)->where('status', 'revision')->count(),
            'pending' => DailyJournal::where('user_id', $user->id)->where('status', 'pending')->count(),
        ];

        return Inertia::render('student/journals/index', [
            'journals' => $journals,
            'todayAttendance' => $todayAttendance,
            'todayJournal' => $todayJournal,
            'stats' => $stats,
        ]);
    }

    /**
     * Store a newly created daily journal.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $today = Carbon::today()->toDateString();

        $todayAttendance = Attendance::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->first();

        if (! $todayAttendance) {
            return redirect()->back()->withErrors([
                'error' => 'Anda harus melakukan presensi masuk terlebih dahulu sebelum mengisi jurnal harian.',
            ]);
        }

        $existing = DailyJournal::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->first();

        if ($existing) {
            return redirect()->back()->withErrors([
                'error' => 'Jurnal harian untuk hari ini sudah pernah dibuat.',
            ]);
        }

        $validated = $request->validate([
            'work_summary' => 'required|string|min:20',
            'challenges' => 'nullable|string',
            'documentation_image' => 'nullable|image|mimes:jpeg,png,jpg|max:3072',
        ], [
            'work_summary.required' => 'Ringkasan pekerjaan / kegiatan wajib diisi.',
            'work_summary.min' => 'Ringkasan pekerjaan minimal 20 karakter.',
        ]);

        $imagePath = null;
        if ($request->hasFile('documentation_image')) {
            $imagePath = $request->file('documentation_image')->store('journals/docs', 'public');
        }

        DailyJournal::create([
            'user_id' => $user->id,
            'attendance_id' => $todayAttendance->id,
            'date' => $today,
            'work_summary' => $validated['work_summary'],
            'challenges' => $validated['challenges'] ?? null,
            'documentation_image_path' => $imagePath,
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Jurnal harian PKL berhasil dikirim dan menunggu verifikasi.');
    }

    /**
     * Update an existing daily journal.
     */
    public function update(Request $request, DailyJournal $journal): RedirectResponse
    {
        $user = $request->user();

        if ($journal->user_id !== $user->id) {
            abort(403);
        }

        if ($journal->status === 'approved') {
            return redirect()->back()->withErrors([
                'error' => 'Jurnal yang telah disetujui (Approved) tidak dapat diubah.',
            ]);
        }

        $validated = $request->validate([
            'work_summary' => 'required|string|min:20',
            'challenges' => 'nullable|string',
            'documentation_image' => 'nullable|image|mimes:jpeg,png,jpg|max:3072',
        ]);

        $data = [
            'work_summary' => $validated['work_summary'],
            'challenges' => $validated['challenges'] ?? null,
            'status' => 'pending', // reset status to pending when updated
        ];

        if ($request->hasFile('documentation_image')) {
            if ($journal->documentation_image_path) {
                Storage::disk('public')->delete($journal->documentation_image_path);
            }
            $data['documentation_image_path'] = $request->file('documentation_image')->store('journals/docs', 'public');
        }

        $journal->update($data);

        return redirect()->back()->with('success', 'Jurnal harian berhasil diperbarui.');
    }
}
