<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

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
});

require __DIR__.'/settings.php';
