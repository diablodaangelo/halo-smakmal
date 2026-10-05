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
     * Display a listing of users with role & search filtering.
     */
    public function index(Request $request): Response
    {
        $role = $request->query('role');
        $search = $request->query('search');

        $users = User::with(['company', 'mentorTeacher'])
            ->when($role, function ($query, $role) {
                $query->where('role', $role);
            })
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('nis_nip', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $companies = Company::orderBy('name')->get(['id', 'name']);
        $teachers = User::where('role', 'guru_pembimbing')->orderBy('name')->get(['id', 'name', 'nis_nip']);

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => [
                'role' => $role ?? 'all',
                'search' => $search ?? '',
            ],
            'companies' => $companies,
            'teachers' => $teachers,
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'nis_nip' => ['nullable', 'string', 'max:50', 'unique:users,nis_nip'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'role' => ['required', 'string', 'in:admin,guru_pembimbing,pembimbing_dudi,siswa'],
            'password' => ['required', 'string', Password::defaults()],
            'company_id' => [
                'nullable',
                Rule::requiredIf(fn () => $request->role === 'pembimbing_dudi'),
                'exists:companies,id',
            ],
            'mentor_teacher_id' => [
                'nullable',
                'exists:users,id',
            ],
        ], [
            'company_id.required' => 'Perusahaan (DUDI) wajib dipilih untuk role Pembimbing DUDI.',
            'nis_nip.unique' => 'NIS / NIP sudah terdaftar.',
            'email.unique' => 'Email sudah terdaftar.',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['email_verified_at'] = now();

        User::create($validated);

        return redirect()->back()->with('success', 'Akun pengguna berhasil dibuat.');
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'nis_nip' => ['nullable', 'string', 'max:50', Rule::unique('users', 'nis_nip')->ignore($user->id)],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'role' => ['required', 'string', 'in:admin,guru_pembimbing,pembimbing_dudi,siswa'],
            'password' => ['nullable', 'string', Password::defaults()],
            'company_id' => [
                'nullable',
                Rule::requiredIf(fn () => $request->role === 'pembimbing_dudi'),
                'exists:companies,id',
            ],
            'mentor_teacher_id' => [
                'nullable',
                'exists:users,id',
            ],
        ], [
            'company_id.required' => 'Perusahaan (DUDI) wajib dipilih untuk role Pembimbing DUDI.',
            'nis_nip.unique' => 'NIS / NIP sudah terdaftar.',
            'email.unique' => 'Email sudah terdaftar.',
        ]);

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        // If role changed from student or dudi, clean up irrevelant relationships
        if ($validated['role'] === 'guru_pembimbing' || $validated['role'] === 'admin') {
            $validated['company_id'] = null;
            $validated['mentor_teacher_id'] = null;
        }

        $user->update($validated);

        return redirect()->back()->with('success', 'Data pengguna berhasil diperbarui.');
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
                    'error' => 'Siswa tidak dapat dihapus karena sudah memiliki riwayat presensi atau jurnal.',
                ]);
            }
        }

        // Check if teacher has mentored students
        if ($user->role === 'guru_pembimbing') {
            if ($user->mentoredStudents()->exists()) {
                return redirect()->back()->withErrors([
                    'error' => 'Guru tidak dapat dihapus karena masih menjadi pembimbing bagi sejumlah siswa. Silakan alihkan siswa terlebih dahulu.',
                ]);
            }
        }

        $user->delete();

        return redirect()->back()->with('success', 'Akun pengguna berhasil dihapus.');
    }
}
