<?php

use App\Http\Controllers\Api\AuthController;
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
