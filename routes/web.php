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

        // Master Akun Pengguna (Guru, DUDI, Siswa, Admin)
        Route::resource('users', \App\Http\Controllers\Admin\UserController::class)->except(['create', 'edit', 'show']);

        // Plotting Penempatan Siswa ke DUDI & Guru Pembimbing
        Route::get('plotting', [\App\Http\Controllers\Admin\PlottingController::class, 'index'])->name('plotting.index');
        Route::post('plotting/company', [\App\Http\Controllers\Admin\PlottingController::class, 'assignCompany'])->name('plotting.company');
        Route::post('plotting/mentor-teacher', [\App\Http\Controllers\Admin\PlottingController::class, 'assignMentorTeacher'])->name('plotting.mentor-teacher');
    });
});

require __DIR__.'/settings.php';
