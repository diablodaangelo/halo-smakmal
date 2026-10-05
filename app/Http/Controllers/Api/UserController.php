<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of users with role and search filters.
     */
    public function index(Request $request): JsonResponse
    {
        $users = User::query()
            ->when($request->filled('role'), function ($query) use ($request) {
                return $query->where('role', $request->role);
            })
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->search;
                return $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('nis_nip', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('company_id'), function ($query) use ($request) {
                return $query->where('company_id', $request->company_id);
            })
            ->when($request->filled('mentor_teacher_id'), function ($query) use ($request) {
                return $query->where('mentor_teacher_id', $request->mentor_teacher_id);
            })
            ->with(['company', 'mentorTeacher'])
            ->withCount(['guidedStudents', 'attendances', 'dailyJournals'])
            ->latest()
            ->paginate($request->query('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $users,
        ]);
    }

    /**
     * Store a newly created user (by Admin).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['nullable', 'string', 'min:6'],
            'role' => ['required', 'in:admin,guru_pembimbing,pembimbing_dudi,siswa'],
            'nis_nip' => ['nullable', 'string', 'max:50'],
            'phone' => ['nullable', 'string', 'max:20'],
            'company_id' => ['nullable', 'exists:companies,id'],
            'mentor_teacher_id' => ['nullable', 'exists:users,id'],
        ]);

        $password = ! empty($validated['password'])
            ? Hash::make($validated['password'])
            : Hash::make('password123'); // default dev password

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $password,
            'role' => $validated['role'],
            'nis_nip' => $validated['nis_nip'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'company_id' => $validated['company_id'] ?? null,
            'mentor_teacher_id' => $validated['mentor_teacher_id'] ?? null,
            'email_verified_at' => now(),
        ]);

        return response()->json([
            'message' => 'Akun pengguna berhasil dibuat.',
            'data' => $user->load(['company', 'mentorTeacher']),
        ], 201);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): JsonResponse
    {
        $user->load(['company', 'mentorTeacher', 'guidedStudents']);

        return response()->json([
            'data' => $user,
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:6'],
            'role' => ['sometimes', 'required', 'in:admin,guru_pembimbing,pembimbing_dudi,siswa'],
            'nis_nip' => ['nullable', 'string', 'max:50'],
            'phone' => ['nullable', 'string', 'max:20'],
            'company_id' => ['nullable', 'exists:companies,id'],
            'mentor_teacher_id' => ['nullable', 'exists:users,id'],
        ]);

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Data pengguna berhasil diperbarui.',
            'data' => $user->fresh(['company', 'mentorTeacher']),
        ]);
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user): JsonResponse
    {
        // Nullify reference on guided students if deleting a teacher
        if ($user->role === 'guru_pembimbing') {
            User::where('mentor_teacher_id', $user->id)->update(['mentor_teacher_id' => null]);
        }

        $user->delete();

        return response()->json([
            'message' => 'Pengguna berhasil dihapus.',
        ]);
    }
}
