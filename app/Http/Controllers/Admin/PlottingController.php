<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlottingController extends Controller
{
    /**
     * Display student plotting interface.
     */
    public function index(Request $request): Response
    {
        $status = $request->query('status'); // 'all', 'unassigned_company', 'unassigned_teacher', 'completed'
        $search = $request->query('search');

        $studentsQuery = User::where('role', 'siswa')
            ->with(['company:id,name,address', 'mentorTeacher:id,name,nis_nip'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('nis_nip', 'like', "%{$search}%");
                });
            });

        if ($status === 'unassigned_company') {
            $studentsQuery->whereNull('company_id');
        } elseif ($status === 'unassigned_teacher') {
            $studentsQuery->whereNull('mentor_teacher_id');
        } elseif ($status === 'completed') {
            $studentsQuery->whereNotNull('company_id')->whereNotNull('mentor_teacher_id');
        }

        $students = $studentsQuery->latest()->paginate(15)->withQueryString();

        $companies = Company::withCount(['users as students_count' => function ($q) {
            $q->where('role', 'siswa');
        }])->orderBy('name')->get(['id', 'name', 'address']);

        $teachers = User::where('role', 'guru_pembimbing')
            ->withCount(['mentoredStudents as students_count'])
            ->orderBy('name')
            ->get(['id', 'name', 'nis_nip']);

        $stats = [
            'total_students' => User::where('role', 'siswa')->count(),
            'without_company' => User::where('role', 'siswa')->whereNull('company_id')->count(),
            'without_teacher' => User::where('role', 'siswa')->whereNull('mentor_teacher_id')->count(),
            'completed' => User::where('role', 'siswa')->whereNotNull('company_id')->whereNotNull('mentor_teacher_id')->count(),
        ];

        return Inertia::render('admin/plotting/index', [
            'students' => $students,
            'companies' => $companies,
            'teachers' => $teachers,
            'stats' => $stats,
            'filters' => [
                'status' => $status ?? 'all',
                'search' => $search ?? '',
            ],
        ]);
    }

    /**
     * Assign student(s) to a company.
     */
    public function assignCompany(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'required|exists:users,id',
            'company_id' => 'nullable|exists:companies,id',
        ]);

        User::whereIn('id', $validated['student_ids'])
            ->where('role', 'siswa')
            ->update(['company_id' => $validated['company_id']]);

        $msg = $validated['company_id'] ? 'Penempatan DUDI siswa berhasil diperbarui.' : 'Penempatan DUDI siswa berhasil di-reset.';

        return redirect()->back()->with('success', $msg);
    }

    /**
     * Assign student(s) to a mentor teacher.
     */
    public function assignMentorTeacher(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'required|exists:users,id',
            'mentor_teacher_id' => 'nullable|exists:users,id',
        ]);

        User::whereIn('id', $validated['student_ids'])
            ->where('role', 'siswa')
            ->update(['mentor_teacher_id' => $validated['mentor_teacher_id']]);

        $msg = $validated['mentor_teacher_id'] ? 'Guru Pembimbing siswa berhasil diperbarui.' : 'Guru Pembimbing siswa berhasil di-reset.';

        return redirect()->back()->with('success', $msg);
    }
}
