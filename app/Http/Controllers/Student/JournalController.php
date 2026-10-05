<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
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
        $user = $request->user()->load('company');

        // Fetch all journals of the student ordered by day_number ascending
        $journals = DailyJournal::where('user_id', $user->id)
            ->orderBy('day_number', 'asc')
            ->get()
            ->map(function ($journal, $idx) {
                $dayNum = $journal->day_number ?: ($idx + 1);
                return [
                    'id' => $journal->id,
                    'day_number' => (int) $dayNum,
                    'work_summary' => $journal->work_summary,
                    'obstacles' => $journal->obstacles,
                    'work_photo_url' => $journal->work_photo ? asset('storage/' . $journal->work_photo) : null,
                    'mentor_notes' => $journal->mentor_notes,
                ];
            });

        // Determine max day filled and next recommended day
        $filledDayNumbers = $journals->pluck('day_number')->toArray();
        $nextDay = 1;
        for ($i = 1; $i <= 120; $i++) {
            if (! in_array($i, $filledDayNumbers)) {
                $nextDay = $i;
                break;
            }
        }

        $stats = [
            'total' => $journals->count(),
            'max_day' => empty($filledDayNumbers) ? 0 : max($filledDayNumbers),
            'next_day' => min(120, $nextDay),
        ];

        return Inertia::render('student/journals/index', [
            'journals' => $journals,
            'stats' => $stats,
            'user' => $user,
        ]);
    }

    /**
     * Store or update daily journal by day number.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'day_number' => 'required|integer|min:1|max:120',
            'work_summary' => 'required|string|min:5',
            'obstacles' => 'nullable|string',
            'work_photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ], [
            'day_number.required' => 'Pilih hari ke berapa PKL.',
            'day_number.min' => 'Pilihan hari minimal Hari Ke-1.',
            'day_number.max' => 'Pilihan hari maksimal Hari Ke-120 (4 bulan).',
            'work_summary.required' => 'Kegiatan / pekerjaan hari ini wajib diisi.',
            'work_summary.min' => 'Kegiatan minimal 5 karakter.',
        ]);

        $dayNumber = (int) $validated['day_number'];

        // 1 day = 1 journal: Find if already exists by day_number
        $journal = DailyJournal::where('user_id', $user->id)
            ->where('day_number', $dayNumber)
            ->first();

        $imagePath = null;
        if ($request->hasFile('work_photo')) {
            $imagePath = $request->file('work_photo')->store('journals/photos', 'public');
        }

        if ($journal) {
            $data = [
                'day_number' => $dayNumber,
                'work_summary' => $validated['work_summary'],
                'obstacles' => $validated['obstacles'] ?? null,
            ];
            if ($imagePath) {
                if ($journal->work_photo) {
                    Storage::disk('public')->delete($journal->work_photo);
                }
                $data['work_photo'] = $imagePath;
            }
            $journal->update($data);

            return redirect()->back()->with('success', "Jurnal Hari Ke-{$dayNumber} berhasil diperbarui.");
        }

        DailyJournal::create([
            'user_id' => $user->id,
            'day_number' => $dayNumber,
            'date' => Carbon::today()->toDateString(),
            'work_summary' => $validated['work_summary'],
            'obstacles' => $validated['obstacles'] ?? null,
            'work_photo' => $imagePath,
        ]);

        return redirect()->back()->with('success', "Jurnal Hari Ke-{$dayNumber} berhasil disimpan.");
    }

    /**
     * Update an existing daily journal.
     */
    public function update(Request $request, DailyJournal $journal): RedirectResponse
    {
        return $this->store($request);
    }
}
