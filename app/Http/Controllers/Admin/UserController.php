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

class UserController extends Controller
{
    /**
     * Display a listing of students and teachers.
     */
    public function index(Request $request): Response
    {
        $role = $request->query('role', 'siswa'); // default to 'siswa' or 'guru_pembimbing'
        $search = $request->query('search');

        // Only allow viewing siswa or guru_pembimbing
        $validRoles = ['siswa', 'guru_pembimbing'];
        if (! in_array($role, $validRoles, true)) {
            $role = 'siswa';
        }

        $users = User::where('role', $role)
            ->with(['company:id,name,address', 'mentorTeacher:id,name,nis_nip'])
            ->withCount(['mentoredStudents as students_count'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('nis_nip', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $companies = Company::orderBy('name')->get(['id', 'name', 'address']);
        $teachers = User::where('role', 'guru_pembimbing')->orderBy('name')->get(['id', 'name', 'nis_nip']);

        $counts = [
            'siswa' => User::where('role', 'siswa')->count(),
            'guru_pembimbing' => User::where('role', 'guru_pembimbing')->count(),
        ];

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => [
                'role' => $role,
                'search' => $search ?? '',
            ],
            'counts' => $counts,
            'companies' => $companies,
            'teachers' => $teachers,
        ]);
    }

    /**
     * Store a newly created student or teacher.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'nis_nip' => ['nullable', 'string', 'max:50', 'unique:users,nis_nip'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'role' => ['required', 'string', 'in:siswa,guru_pembimbing'],
            'password' => ['required', 'string', Password::defaults()],
            'company_id' => [
                'nullable',
                'exists:companies,id',
            ],
            'mentor_teacher_id' => [
                'nullable',
                'exists:users,id',
            ],
        ], [
            'nis_nip.unique' => 'NIS / NIP sudah terdaftar.',
            'email.unique' => 'Email sudah terdaftar.',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['email_verified_at'] = now();

        // If guru, they don't have company or mentor teacher
        if ($validated['role'] === 'guru_pembimbing') {
            $validated['company_id'] = null;
            $validated['mentor_teacher_id'] = null;
        }

        User::create($validated);

        $roleLabel = $validated['role'] === 'siswa' ? 'Siswa' : 'Guru Pembimbing';

        return redirect()->back()->with('success', "Akun {$roleLabel} berhasil ditambahkan.");
    }

    /**
     * Update the specified student or teacher.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'nis_nip' => ['nullable', 'string', 'max:50', Rule::unique('users', 'nis_nip')->ignore($user->id)],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'role' => ['required', 'string', 'in:siswa,guru_pembimbing'],
            'password' => ['nullable', 'string', Password::defaults()],
            'company_id' => [
                'nullable',
                'exists:companies,id',
            ],
            'mentor_teacher_id' => [
                'nullable',
                'exists:users,id',
            ],
        ], [
            'nis_nip.unique' => 'NIS / NIP sudah terdaftar.',
            'email.unique' => 'Email sudah terdaftar.',
        ]);

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        // If role is guru, always ensure company_id & mentor_teacher_id are null
        if ($validated['role'] === 'guru_pembimbing') {
            $validated['company_id'] = null;
            $validated['mentor_teacher_id'] = null;
        }

        $user->update($validated);

        $roleLabel = $user->role === 'siswa' ? 'Siswa' : 'Guru Pembimbing';

        return redirect()->back()->with('success', "Data {$roleLabel} berhasil diperbarui.");
    }

    /**
     * Remove the specified user.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($request->user()->id === $user->id) {
            return redirect()->back()->withErrors([
                'error' => 'Anda tidak dapat menghapus akun Anda sendiri.',
            ]);
        }

        // Check if student has attendance or journals
        if ($user->role === 'siswa') {
            if ($user->attendances()->exists() || $user->dailyJournals()->exists()) {
                return redirect()->back()->withErrors([
                    'error' => 'Siswa tidak dapat dihapus karena sudah memiliki data presensi atau jurnal.',
                ]);
            }
        }

        // Check if teacher has mentored students
        if ($user->role === 'guru_pembimbing') {
            if ($user->mentoredStudents()->exists()) {
                return redirect()->back()->withErrors([
                    'error' => 'Guru tidak dapat dihapus karena masih menjadi pembimbing bagi sejumlah siswa. Silakan pindahkan siswa binaannya terlebih dahulu.',
                ]);
            }
        }

        $user->delete();

        return redirect()->back()->with('success', 'Akun berhasil dihapus.');
    }
}
