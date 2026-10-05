<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewJournalRequest;
use App\Models\DailyJournal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JournalReviewController extends Controller
{
    /**
     * Display a listing of journals for review.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $journals = DailyJournal::query()
            ->when($user->role === 'pembimbing_dudi', function ($query) use ($user) {
                return $query->whereHas('user', function ($q) use ($user) {
                    $q->where('company_id', $user->company_id);
                });
            })
            ->when($user->role !== 'pembimbing_dudi' && $request->filled('company_id'), function ($query) use ($request) {
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
            ->when($request->filled('date'), function ($query) use ($request) {
                return $query->whereDate('date', $request->date);
            })
            ->when($request->filled('start_date'), function ($query) use ($request) {
                return $query->whereDate('date', '>=', $request->start_date);
            })
            ->when($request->filled('end_date'), function ($query) use ($request) {
                return $query->whereDate('date', '<=', $request->end_date);
            })
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->search;
                return $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('nis_nip', 'like', "%{$search}%");
                });
            })
            ->with(['user.company', 'attendance', 'prayerLogs'])
            ->orderBy('date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate($request->query('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $journals,
        ]);
    }

    /**
     * Display the specified daily journal for review.
     */
    public function show(Request $request, int|string $id): JsonResponse
    {
        $user = $request->user();
        $journal = DailyJournal::with(['user.company', 'attendance', 'prayerLogs'])->findOrFail($id);

        if ($user->role === 'pembimbing_dudi' && $journal->user?->company_id !== $user->company_id) {
            return response()->json([
                'message' => 'Akses ditolak. Jurnal ini bukan milik siswa di instansi Anda.',
            ], 403);
        }

        return response()->json([
            'data' => $journal,
        ]);
    }

    /**
     * Review / Approve / Request revision for a daily journal.
     */
    public function review(ReviewJournalRequest $request, int|string $id): JsonResponse
    {
        $user = $request->user();
        $journal = DailyJournal::with(['user'])->findOrFail($id);

        if ($user->role === 'pembimbing_dudi' && $journal->user?->company_id !== $user->company_id) {
            return response()->json([
                'message' => 'Akses ditolak. Jurnal ini bukan milik siswa di instansi Anda.',
            ], 403);
        }

        $journal->update([
            'status' => $request->status,
            'mentor_notes' => $request->mentor_notes,
        ]);

        return response()->json([
            'message' => 'Review jurnal berhasil disimpan.',
            'data' => $journal->fresh(['user.company', 'attendance', 'prayerLogs']),
        ]);
    }
}
