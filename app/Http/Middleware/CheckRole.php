<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! $request->user() || ! in_array($request->user()->role, $roles, true)) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Akses ditolak. Anda tidak memiliki izin untuk mengakses resource ini.',
                ], 403);
            }

            $readableRoles = array_map(fn ($r) => match ($r) {
                'admin' => 'Administrator',
                'guru_pembimbing' => 'Guru Pembimbing',
                'siswa' => 'Siswa PKL',
                default => $r,
            }, $roles);

            return Inertia::render('error', [
                'status' => 403,
                'message' => 'Akses ditolak. Halaman ini hanya dapat diakses oleh peran ' . implode(' atau ', $readableRoles) . '.',
            ])->toResponse($request)->setStatusCode(403);
        }

        return $next($request);
    }
}
