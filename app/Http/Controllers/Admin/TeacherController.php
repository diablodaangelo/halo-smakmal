<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class TeacherController extends Controller
{
    /**
     * Display a listing of teachers (Guru Pembimbing).
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');

        $teachers = User::where('role', 'guru_pembimbing')
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

        return Inertia::render('admin/teachers/index', [
            'teachers' => $teachers,
            'filters' => [
                'search' => $search ?? '',
            ],
        ]);
    }

    /**
     * Store a newly created teacher.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'nis_nip' => ['nullable', 'string', 'max:50', 'unique:users,nis_nip'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'string', Password::defaults()],
        ], [
            'nis_nip.unique' => 'NIP sudah terdaftar pada guru lain.',
            'email.unique' => 'Email sudah terdaftar.',
        ]);

        $validated['role'] = 'guru_pembimbing';
        $validated['password'] = Hash::make($validated['password']);
        $validated['email_verified_at'] = now();
        $validated['company_id'] = null;
        $validated['mentor_teacher_id'] = null;
        $validated['phone'] = $validated['phone_number'] ?? null;
        unset($validated['phone_number']);

        User::create($validated);

        return redirect()->back()->with('success', 'Akun Guru Pembimbing berhasil ditambahkan.');
    }

    /**
     * Update the specified teacher.
     */
    public function update(Request $request, User $teacher): RedirectResponse
    {
        // Ensure user is a teacher
        if ($teacher->role !== 'guru_pembimbing') {
            abort(404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($teacher->id)],
            'nis_nip' => ['nullable', 'string', 'max:50', Rule::unique('users', 'nis_nip')->ignore($teacher->id)],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'password' => ['nullable', 'string', Password::defaults()],
        ], [
            'nis_nip.unique' => 'NIP sudah terdaftar pada guru lain.',
            'email.unique' => 'Email sudah terdaftar.',
        ]);

        if (array_key_exists('phone_number', $validated)) {
            $validated['phone'] = $validated['phone_number'];
            unset($validated['phone_number']);
        }

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $teacher->update($validated);

        return redirect()->back()->with('success', 'Data Guru Pembimbing berhasil diperbarui.');
    }

    /**
     * Remove the specified teacher.
     */
    public function destroy(Request $request, User $teacher): RedirectResponse
    {
        if ($teacher->role !== 'guru_pembimbing') {
            abort(404);
        }

        if ($request->user()->id === $teacher->id) {
            return redirect()->back()->withErrors([
                'error' => 'Anda tidak dapat menghapus akun Anda sendiri.',
            ]);
        }

        if ($teacher->mentoredStudents()->exists()) {
            return redirect()->back()->withErrors([
                'error' => 'Guru tidak dapat dihapus karena masih menjadi pembimbing bagi sejumlah siswa. Silakan alihkan siswa binaannya ke guru lain terlebih dahulu.',
            ]);
        }

        $teacher->delete();

        return redirect()->back()->with('success', 'Akun Guru Pembimbing berhasil dihapus.');
    }
}
