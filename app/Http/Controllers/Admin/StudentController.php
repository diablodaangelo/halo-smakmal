<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    /**
     * Display a listing of students (Siswa PKL).
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $companyFilter = $request->query('company_id');
        $teacherFilter = $request->query('teacher_id');

        $students = User::where('role', 'siswa')
            ->with(['company:id,name,address', 'mentorTeacher:id,name,nis_nip'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('nis_nip', 'like', "%{$search}%");
                });
            })
            ->when($companyFilter, function ($query, $companyId) {
                if ($companyId === 'unassigned') {
                    $query->whereNull('company_id');
                } else {
                    $query->where('company_id', $companyId);
                }
            })
            ->when($teacherFilter, function ($query, $teacherId) {
                if ($teacherId === 'unassigned') {
                    $query->whereNull('mentor_teacher_id');
                } else {
                    $query->where('mentor_teacher_id', $teacherId);
                }
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $companies = Company::orderBy('name')->get(['id', 'name', 'address']);
        $teachers = User::where('role', 'guru_pembimbing')->orderBy('name')->get(['id', 'name', 'nis_nip']);

        $totalStudents = User::where('role', 'siswa')->count();
        $assignedDudiCount = User::where('role', 'siswa')->whereNotNull('company_id')->count();
        $unassignedDudiCount = $totalStudents - $assignedDudiCount;
        $unassignedTeacherCount = User::where('role', 'siswa')->whereNull('mentor_teacher_id')->count();

        return Inertia::render('admin/students/index', [
            'students' => $students,
            'filters' => [
                'search' => $search ?? '',
                'company_id' => $companyFilter ?? '',
                'teacher_id' => $teacherFilter ?? '',
            ],
            'companies' => $companies,
            'teachers' => $teachers,
            'metrics' => [
                'total' => $totalStudents,
                'assigned_dudi' => $assignedDudiCount,
                'unassigned_dudi' => $unassignedDudiCount,
                'unassigned_teacher' => $unassignedTeacherCount,
            ],
        ]);
    }

    /**
     * Store a newly created student.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'nis_nip' => ['nullable', 'string', 'max:50', 'unique:users,nis_nip'],
            'password' => ['required', 'string', Password::defaults()],
            'company_id' => ['nullable', 'exists:companies,id'],
            'mentor_teacher_id' => ['nullable', 'exists:users,id'],
        ], [
            'nis_nip.unique' => 'NIS / NISN sudah terdaftar.',
            'email.unique' => 'Email sudah terdaftar.',
        ]);

        $validated['role'] = 'siswa';
        $validated['password'] = Hash::make($validated['password']);
        $validated['email_verified_at'] = now();

        User::create($validated);

        return redirect()->back()->with('success', 'Akun Siswa PKL berhasil ditambahkan.');
    }

    /**
     * Update the specified student.
     */
    public function update(Request $request, User $student): RedirectResponse
    {
        if ($student->role !== 'siswa') {
            abort(404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($student->id)],
            'nis_nip' => ['nullable', 'string', 'max:50', Rule::unique('users', 'nis_nip')->ignore($student->id)],
            'password' => ['nullable', 'string', Password::defaults()],
            'company_id' => ['nullable', 'exists:companies,id'],
            'mentor_teacher_id' => ['nullable', 'exists:users,id'],
        ], [
            'nis_nip.unique' => 'NIS / NISN sudah terdaftar.',
            'email.unique' => 'Email sudah terdaftar.',
        ]);

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $student->update($validated);

        return redirect()->back()->with('success', 'Data Siswa PKL berhasil diperbarui.');
    }

    /**
     * Remove the specified student.
     */
    public function destroy(Request $request, User $student): RedirectResponse
    {
        if ($student->role !== 'siswa') {
            abort(404);
        }

        if ($student->attendances()->exists() || $student->dailyJournals()->exists()) {
            return redirect()->back()->withErrors([
                'error' => 'Siswa tidak dapat dihapus karena sudah memiliki rekaman presensi atau jurnal.',
            ]);
        }

        $student->delete();

        return redirect()->back()->with('success', 'Akun Siswa berhasil dihapus.');
    }
}
