<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlottingController extends Controller
{
    /**
     * Get overall plotting statistics for Admin dashboard.
     */
    public function overview(): JsonResponse
    {
        $totalStudents = User::where('role', 'siswa')->count();
        $placedCompany = User::where('role', 'siswa')->whereNotNull('company_id')->count();
        $assignedTeacher = User::where('role', 'siswa')->whereNotNull('mentor_teacher_id')->count();

        $teachers = User::where('role', 'guru_pembimbing')
            ->withCount('guidedStudents')
            ->get();

        $companies = Company::withCount(['users as students_count' => fn($q) => $q->where('role', 'siswa')])
            ->get();

        $unassignedCompanyStudents = User::where('role', 'siswa')
            ->whereNull('company_id')
            ->get();

        $unassignedTeacherStudents = User::where('role', 'siswa')
            ->whereNull('mentor_teacher_id')
            ->get();

        return response()->json([
            'status' => 'success',
            'summary' => [
                'total_students' => $totalStudents,
                'placed_company_students' => $placedCompany,
                'unassigned_company_students' => $totalStudents - $placedCompany,
                'assigned_teacher_students' => $assignedTeacher,
                'unassigned_teacher_students' => $totalStudents - $assignedTeacher,
            ],
            'teachers' => $teachers,
            'companies' => $companies,
            'unassigned_company_list' => $unassignedCompanyStudents,
            'unassigned_teacher_list' => $unassignedTeacherStudents,
        ]);
    }

    /**
     * Assign students to a DUDI company.
     */
    public function assignCompany(Request $request): JsonResponse
    {
        $request->validate([
            'student_ids' => ['required', 'array', 'min:1'],
            'student_ids.*' => ['required', 'integer', 'exists:users,id'],
            'company_id' => ['required', 'integer', 'exists:companies,id'],
        ]);

        $updated = User::whereIn('id', $request->student_ids)
            ->where('role', 'siswa')
            ->update(['company_id' => $request->company_id]);

        return response()->json([
            'message' => 'Siswa berhasil ditempatkan di kantor DUDI.',
            'count' => $updated,
        ]);
    }

    /**
     * Unassign students from their company.
     */
    public function unassignCompany(Request $request): JsonResponse
    {
        $request->validate([
            'student_ids' => ['required', 'array', 'min:1'],
            'student_ids.*' => ['required', 'integer', 'exists:users,id'],
        ]);

        $updated = User::whereIn('id', $request->student_ids)
            ->where('role', 'siswa')
            ->update(['company_id' => null]);

        return response()->json([
            'message' => 'Penempatan DUDI siswa berhasil dilepas.',
            'count' => $updated,
        ]);
    }

    /**
     * Assign students to a Guru Pembimbing.
     */
    public function assignMentor(Request $request): JsonResponse
    {
        $request->validate([
            'student_ids' => ['required', 'array', 'min:1'],
            'student_ids.*' => ['required', 'integer', 'exists:users,id'],
            'mentor_teacher_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $teacher = User::where('id', $request->mentor_teacher_id)
            ->where('role', 'guru_pembimbing')
            ->firstOrFail();

        $updated = User::whereIn('id', $request->student_ids)
            ->where('role', 'siswa')
            ->update(['mentor_teacher_id' => $teacher->id]);

        return response()->json([
            'message' => 'Siswa berhasil dipetakan ke Guru Pembimbing.',
            'teacher' => $teacher->name,
            'count' => $updated,
        ]);
    }

    /**
     * Unassign students from their Guru Pembimbing.
     */
    public function unassignMentor(Request $request): JsonResponse
    {
        $request->validate([
            'student_ids' => ['required', 'array', 'min:1'],
            'student_ids.*' => ['required', 'integer', 'exists:users,id'],
        ]);

        $updated = User::whereIn('id', $request->student_ids)
            ->where('role', 'siswa')
            ->update(['mentor_teacher_id' => null]);

        return response()->json([
            'message' => 'Bimbingan siswa berhasil dilepas.',
            'count' => $updated,
        ]);
    }
}
