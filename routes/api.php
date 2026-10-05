<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\DailyJournalController;
use App\Http\Controllers\Api\JournalReviewController;
use App\Http\Controllers\Api\PlottingController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\StudentPlacementController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Halo-Smakmal
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Public Authentication Route (Login only, No Public Register)
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

        // ==========================================
        // 1. ADMIN KHUSUS (Master Data, Users, Plotting)
        // ==========================================
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            // Master Data Perusahaan DUDI
            Route::apiResource('companies', CompanyController::class);

            // Master Data Pengguna (Guru, Siswa, Pembimbing DUDI)
            Route::apiResource('users', UserController::class);

            // Plotting Siswa ke DUDI & Guru Pembimbing
            Route::prefix('placements')->group(function () {
                Route::get('/overview', [PlottingController::class, 'overview']);
                Route::post('/company/assign', [PlottingController::class, 'assignCompany']);
                Route::post('/company/unassign', [PlottingController::class, 'unassignCompany']);
                Route::post('/mentor/assign', [PlottingController::class, 'assignMentor']);
                Route::post('/mentor/unassign', [PlottingController::class, 'unassignMentor']);
                Route::get('/unassigned-students', [StudentPlacementController::class, 'getUnassignedStudents']);
            });
        });

        // ==========================================
        // 2. GURU PEMBIMBING & ADMIN (Monitoring & Reports)
        // ==========================================
        Route::middleware('role:guru_pembimbing,admin')->prefix('reports')->group(function () {
            Route::get('/attendances', [ReportController::class, 'attendanceSummary']);
            Route::get('/journals', [ReportController::class, 'journalRecap']);
        });

        // ==========================================
        // 3. PEMBIMBING DUDI, GURU, ADMIN (Review Jurnal)
        // ==========================================
        Route::middleware('role:pembimbing_dudi,guru_pembimbing,admin')->prefix('reviews')->group(function () {
            Route::get('/journals', [JournalReviewController::class, 'index']);
            Route::get('/journals/{id}', [JournalReviewController::class, 'show']);
            Route::put('/journals/{id}', [JournalReviewController::class, 'review']);
        });

        // ==========================================
        // 4. SISWA KHUSUS (Presensi GPS + Jurnal & Salat)
        // ==========================================
        Route::middleware('role:siswa')->group(function () {
            // Presensi Geofencing GPS & Live Selfie
            Route::prefix('attendance')->group(function () {
                Route::post('/check-in', [AttendanceController::class, 'checkIn']);
                Route::post('/check-out', [AttendanceController::class, 'checkOut']);
                Route::get('/today', [AttendanceController::class, 'todayStatus']);
                Route::get('/history', [AttendanceController::class, 'history']);
            });

            // Jurnal Harian & Log Salat
            Route::prefix('journals')->group(function () {
                Route::get('/', [DailyJournalController::class, 'myJournals']);
                Route::post('/', [DailyJournalController::class, 'store']);
                Route::get('/{id}', [DailyJournalController::class, 'show']);
                Route::post('/{id}', [DailyJournalController::class, 'update']);
            });
        });

        // ==========================================
        // Role Test Endpoints
        // ==========================================
        Route::middleware('role:admin')->get('/admin/dashboard', fn(Request $r) => response()->json(['message' => 'Panel Admin', 'user' => $r->user()]));
        Route::middleware('role:guru_pembimbing')->get('/guru/dashboard', fn(Request $r) => response()->json(['message' => 'Panel Guru', 'user' => $r->user()]));
        Route::middleware('role:pembimbing_dudi')->get('/dudi/dashboard', fn(Request $r) => response()->json(['message' => 'Panel DUDI', 'user' => $r->user()]));
        Route::middleware('role:siswa')->get('/siswa/dashboard', fn(Request $r) => response()->json(['message' => 'Panel Siswa', 'user' => $r->user()]));
    });
});
