<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle user login with email or nis_nip.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'nullable|email',
            'nis_nip' => 'nullable|string',
            'password' => 'required|string',
        ]);

        if (! $request->filled('email') && ! $request->filled('nis_nip')) {
            return response()->json([
                'message' => 'Silakan masukkan email atau NIS/NIP.',
            ], 422);
        }

        $user = User::query()
            ->when($request->filled('email'), function ($query) use ($request) {
                return $query->where('email', $request->email);
            })
            ->when(! $request->filled('email') && $request->filled('nis_nip'), function ($query) use ($request) {
                return $query->where('nis_nip', $request->nis_nip);
            })
            ->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Kredensial tidak valid',
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('company'),
        ]);
    }

    /**
     * Handle user logout and revoke current token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Berhasil logout',
        ]);
    }

    /**
     * Get authenticated user profile.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()->load('company'),
        ]);
    }
}
