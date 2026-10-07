<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Company;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeacherProfileController extends Controller
{
    /**
     * Display the specified teacher profile by slug or ID.
     */
    public function show(Request $request, string $slug): Response
    {
        $teacher = User::where('role', 'guru_pembimbing')
            ->where(function ($query) use ($slug) {
                $query->where('slug', $slug)
                    ->orWhere('id', $slug);
            })
            ->firstOrFail();

        $today = Carbon::today()->toDateString();

        // Get students mentored by this teacher
        $guidedStudents = User::where('role', 'siswa')
            ->where('mentor_teacher_id', $teacher->id)
            ->with(['company'])
            ->get()
            ->map(function ($student) use ($today) {
                $todayAtt = Attendance::where('user_id', $student->id)
                    ->whereDate('date', $today)
                    ->first();

                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'slug' => $student->slug,
                    'nickname' => $student->nickname,
                    'nis_nip' => $student->nis_nip,
                    'phone' => $student->phone,
                    'avatar_url' => $student->avatar_url,
                    'company' => $student->company ? [
                        'id' => $student->company->id,
                        'name' => $student->company->name,
                        'address' => $student->company->address,
                    ] : null,
                    'today_attendance' => $todayAtt ? [
                        'status' => $todayAtt->status,
                        'check_in_time' => $todayAtt->check_in_time ? substr($todayAtt->check_in_time, 0, 5) : null,
                        'check_out_time' => $todayAtt->check_out_time ? substr($todayAtt->check_out_time, 0, 5) : null,
                    ] : null,
                ];
            });

        // Calculate unique companies count
        $uniqueCompanyIds = $guidedStudents->pluck('company.id')->filter()->unique();
        $totalCompaniesCount = $uniqueCompanyIds->count();
        $todayPresentCount = $guidedStudents->filter(fn($s) => !empty($s['today_attendance']))->count();

        $teacherData = [
            'id' => $teacher->id,
            'name' => $teacher->name,
            'slug' => $teacher->slug,
            'nickname' => $teacher->nickname,
            'email' => $teacher->email,
            'nis_nip' => $teacher->nis_nip,
            'phone' => $teacher->phone,
            'avatar_url' => $teacher->avatar_url,
            'role' => $teacher->role,
            'created_at_formatted' => $teacher->created_at ? $teacher->created_at->isoFormat('MMMM Y') : null,
            'stats' => [
                'total_students' => $guidedStudents->count(),
                'total_companies' => $totalCompaniesCount,
                'today_present' => $todayPresentCount,
            ],
            'guided_students' => $guidedStudents,
        ];

        return Inertia::render('teacher/profile', [
            'teacher' => $teacherData,
        ]);
    }
}
