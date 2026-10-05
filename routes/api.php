<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\DailyJournalController;
use App\Http\Controllers\Api\JournalReviewController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\StudentPlacementController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Halo-Smakmal
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Public Authentication Route
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
    });

    // Protected Routes (auth:sanctum)
    Route::middleware('auth:sanctum')->group(function () {
        // Authenticated User Profile & Logout
        Route::prefix('auth')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
        });

        // Master Data Management & Placements (Admin & Guru Pembimbing)
        Route::middleware('role:admin,guru_pembimbing')->group(function () {
            // Companies CRUD
            Route::apiResource('companies', CompanyController::class);

            // Student Placements
            Route::prefix('placements')->group(function () {
                Route::get('/unassigned-students', [StudentPlacementController::class, 'getUnassignedStudents']);
                Route::post('/assign', [StudentPlacementController::class, 'assign']);
                Route::post('/unassign', [StudentPlacementController::class, 'unassign']);
            });
        });

        // Attendance Module (Siswa)
        Route::middleware('role:siswa')->prefix('attendance')->group(function () {
            Route::post('/check-in', [AttendanceController::class, 'checkIn']);
            Route::post('/check-out', [AttendanceController::class, 'checkOut']);
            Route::get('/today', [AttendanceController::class, 'todayStatus']);
            Route::get('/history', [AttendanceController::class, 'history']);
        });

        // Daily Journal & Prayer Log Module (Siswa)
        Route::middleware('role:siswa')->prefix('journals')->group(function () {
            Route::get('/', [DailyJournalController::class, 'myJournals']);
            Route::post('/', [DailyJournalController::class, 'store']);
            Route::get('/{id}', [DailyJournalController::class, 'show']);
            Route::post('/{id}', [DailyJournalController::class, 'update']);
        });

        // Mentor Review & Journal Approval (Pembimbing DUDI, Guru Pembimbing, Admin)
        Route::middleware('role:pembimbing_dudi,guru_pembimbing,admin')->prefix('reviews')->group(function () {
            Route::get('/journals', [JournalReviewController::class, 'index']);
            Route::get('/journals/{id}', [JournalReviewController::class, 'show']);
            Route::put('/journals/{id}', [JournalReviewController::class, 'review']);
        });

        // Reports & Aggregation (Admin & Guru Pembimbing)
        Route::middleware('role:guru_pembimbing,admin')->prefix('reports')->group(function () {
            Route::get('/attendances', [ReportController::class, 'attendanceSummary']);
            Route::get('/journals', [ReportController::class, 'journalRecap']);
        });

        // Role-Based Test Endpoints (RBAC)
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            Route::get('/dashboard', function (Request $request) {
                return response()->json([
                    'message' => 'Selamat datang di Panel Admin',
                    'user' => $request->user(),
                ]);
            });
        });

        Route::middleware('role:guru_pembimbing')->prefix('guru')->group(function () {
            Route::get('/dashboard', function (Request $request) {
                return response()->json([
                    'message' => 'Selamat datang di Panel Guru Pembimbing',
                    'user' => $request->user(),
                ]);
            });
        });

        Route::middleware('role:pembimbing_dudi')->prefix('dudi')->group(function () {
            Route::get('/dashboard', function (Request $request) {
                return response()->json([
                    'message' => 'Selamat datang di Panel Pembimbing DUDI',
                    'user' => $request->user(),
                ]);
            });
        });

        Route::middleware('role:siswa')->prefix('siswa')->group(function () {
            Route::get('/dashboard', function (Request $request) {
                return response()->json([
                    'message' => 'Selamat datang di Panel Siswa',
                    'user' => $request->user(),
                ]);
            });
        });
    });
});
