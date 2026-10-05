<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignStudentRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentPlacementController extends Controller
{
    /**
     * Get all students who do not have a company assignment yet.
     */
    public function getUnassignedStudents(): JsonResponse
    {
        $students = User::query()
            ->where('role', 'siswa')
            ->whereNull('company_id')
            ->orderBy('name')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $students,
        ]);
    }

    /**
     * Assign one or multiple students to a company.
     */
    public function assign(AssignStudentRequest $request): JsonResponse
    {
        $updatedCount = User::whereIn('id', $request->student_ids)
            ->where('role', 'siswa')
            ->update(['company_id' => $request->company_id]);

        return response()->json([
            'message' => 'Siswa berhasil ditempatkan di instansi.',
            'assigned_count' => $updatedCount,
        ]);
    }

    /**
     * Unassign one or multiple students from their current company.
     */
    public function unassign(Request $request): JsonResponse
    {
        $request->validate([
            'student_ids' => ['required', 'array', 'min:1'],
            'student_ids.*' => ['required', 'integer', 'exists:users,id'],
        ]);

        $updatedCount = User::whereIn('id', $request->student_ids)
            ->where('role', 'siswa')
            ->update(['company_id' => null]);

        return response()->json([
            'message' => 'Penempatan siswa berhasil dilepas.',
            'unassigned_count' => $updatedCount,
        ]);
    }
}
