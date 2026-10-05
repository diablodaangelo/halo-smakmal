<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\DailyJournal;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JournalReviewController extends Controller
{
    /**
     * Display list of student journals for teacher review.
     */
    public function index(Request $request): Response
    {
        $teacher = $request->user();
        $studentId = $request->input('student_id');
        $date = $request->input('date');

        $students = User::where('mentor_teacher_id', $teacher->id)
            ->where('role', 'siswa')
            ->with('company')
            ->withCount([
                'dailyJournals as total_journals_count',
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
                    ] : null,
                    'stats' => [
                        'total_journals' => (int) $student->total_journals_count,
                    ],
                ];
            });

        $query = DailyJournal::whereHas('user', function ($q) use ($teacher) {
            $q->where('mentor_teacher_id', $teacher->id);
        })->with(['user.company', 'attendance', 'prayerLogs']);

        if ($studentId) {
            $query->where('user_id', $studentId);
        }

        if ($date) {
            $query->whereDate('date', $date);
        }

        // Calculate day numbering map per student
        $allStudentJournals = DailyJournal::whereHas('user', fn($q) => $q->where('mentor_teacher_id', $teacher->id))
            ->orderBy('date', 'asc')
            ->get(['id', 'user_id', 'date']);

        $studentDayCounters = [];
        $dayMap = [];
        foreach ($allStudentJournals as $j) {
            $uId = $j->user_id;
            if (!isset($studentDayCounters[$uId])) {
                $studentDayCounters[$uId] = 0;
            }
            $studentDayCounters[$uId]++;
            $dayMap[$j->id] = $studentDayCounters[$uId];
        }

        $orderColumn = 'day_number';
        $orderDirection = $studentId ? 'asc' : 'desc';
        $journals = $query->orderBy('day_number', $orderDirection)->orderBy('created_at', $orderDirection)->paginate(25)->through(function ($journal) {
            return [
                'id' => $journal->id,
                'user_id' => $journal->user_id,
                'day_number' => (int) ($journal->day_number ?: 1),
                'user' => [
                    'id' => $journal->user?->id,
                    'name' => $journal->user?->name,
                    'nis_nip' => $journal->user?->nis_nip,
                    'company_name' => $journal->user?->company?->name ?? 'Belum Diplot',
                ],
                'date' => $journal->date instanceof Carbon ? $journal->date->format('Y-m-d') : (string) $journal->date,
                'date_formatted' => $journal->date instanceof Carbon ? $journal->date->isoFormat('dddd, D MMMM Y') : Carbon::parse($journal->date)->isoFormat('dddd, D MMMM Y'),
                'work_summary' => $journal->work_summary,
                'obstacles' => $journal->obstacles,
                'work_photo_url' => $journal->work_photo ? asset('storage/' . $journal->work_photo) : null,
                'mentor_notes' => $journal->mentor_notes,
                'attendance' => $journal->attendance ? [
                    'check_in_time' => $journal->attendance->check_in_time ? substr($journal->attendance->check_in_time, 0, 5) : null,
                    'check_out_time' => $journal->attendance->check_out_time ? substr($journal->attendance->check_out_time, 0, 5) : null,
                    'status' => $journal->attendance->status,
                ] : null,
                'prayer_logs' => $journal->prayerLogs->map(fn($p) => [
                    'prayer_type' => $p->prayer_type,
                    'status' => $p->status,
                    'prayer_time' => $p->prayer_time ? substr($p->prayer_time, 0, 5) : null,
                ]),
                'created_at' => $journal->created_at->diffForHumans(),
            ];
        });

        // Summary Stats
        $baseQuery = DailyJournal::whereHas('user', fn($q) => $q->where('mentor_teacher_id', $teacher->id));
        $stats = [
            'total_journals' => (clone $baseQuery)->count(),
            'total_students' => $students->count(),
        ];

        return Inertia::render('teacher/journals/index', [
            'journals' => $journals,
            'students' => $students,
            'stats' => $stats,
            'filters' => [
                'student_id' => $studentId ? (int) $studentId : null,
                'date' => $date,
            ],
        ]);
    }

    /**
     * Update journal review notes / guidance feedback.
     */
    public function update(Request $request, DailyJournal $journal): RedirectResponse
    {
        $teacher = $request->user();

        // Check ownership
        if ($journal->user?->mentor_teacher_id !== $teacher->id) {
            abort(403, 'Anda tidak memiliki akses untuk mereview jurnal siswa ini.');
        }

        $validated = $request->validate([
            'mentor_notes' => 'nullable|string|max:1000',
        ]);

        $journal->update([
            'mentor_notes' => $validated['mentor_notes'] ?? null,
        ]);

        return redirect()->back()->with('success', "Catatan bimbingan untuk jurnal siswa {$journal->user->name} berhasil disimpan.");
    }
}
