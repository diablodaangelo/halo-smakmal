<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Admin Group Routes
    Route::middleware(['check.role:admin'])->prefix('admin')->name('admin.')->group(function () {
        // Master Data Perusahaan / DUDI
        Route::resource('companies', \App\Http\Controllers\Admin\CompanyController::class)->except(['create', 'edit', 'show']);

        // Kelola Guru Pembimbing
        Route::resource('teachers', \App\Http\Controllers\Admin\TeacherController::class)->except(['create', 'edit', 'show']);

        // Kelola Siswa PKL
        Route::resource('students', \App\Http\Controllers\Admin\StudentController::class)->except(['create', 'edit', 'show']);
    });

    // Student (Siswa) Group Routes
    Route::middleware(['check.role:siswa'])->prefix('student')->name('student.')->group(function () {
        // Attendance History & Live Actions
        Route::get('attendances', [\App\Http\Controllers\Student\AttendanceController::class, 'index'])->name('attendances.index');
        Route::post('attendance/check-in', [\App\Http\Controllers\Student\AttendanceController::class, 'checkIn'])->name('attendance.check-in');
        Route::post('attendance/check-out', [\App\Http\Controllers\Student\AttendanceController::class, 'checkOut'])->name('attendance.check-out');

        // Jurnal Harian PKL
        Route::get('journals', [\App\Http\Controllers\Student\JournalController::class, 'index'])->name('journals.index');
        Route::post('journals', [\App\Http\Controllers\Student\JournalController::class, 'store'])->name('journals.store');
        Route::post('journals/{journal}', [\App\Http\Controllers\Student\JournalController::class, 'update'])->name('journals.update');

        // Jadwal & Log Salat
        Route::get('prayers', [\App\Http\Controllers\Student\PrayerController::class, 'index'])->name('prayers.index');
        Route::post('prayers', [\App\Http\Controllers\Student\PrayerController::class, 'store'])->name('prayers.store');
    });

    // Teacher (Guru Pembimbing) Group Routes
    Route::middleware(['check.role:guru_pembimbing'])->prefix('teacher')->name('teacher.')->group(function () {
        // Presensi Siswa Binaan
        Route::get('attendances', [\App\Http\Controllers\Teacher\AttendanceController::class, 'index'])->name('attendances.index');

        // Review Jurnal Siswa
        Route::get('journals', [\App\Http\Controllers\Teacher\JournalReviewController::class, 'index'])->name('journals.index');
        Route::post('journals/{journal}/review', [\App\Http\Controllers\Teacher\JournalReviewController::class, 'update'])->name('journals.update');

        // Review Salat Siswa
        Route::get('prayers', [\App\Http\Controllers\Teacher\PrayerReviewController::class, 'index'])->name('prayers.index');
    });
});

require __DIR__.'/settings.php';
