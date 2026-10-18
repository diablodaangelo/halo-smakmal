<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'pending_permissions_count' => fn () => $request->user()?->role === 'guru_pembimbing'
                ? \App\Models\Attendance::whereHas('user', fn($q) => $q->where('mentor_teacher_id', $request->user()->id))
                    ->whereIn('status', ['izin', 'sakit'])
                    ->whereNull('is_approved')
                    ->count()
                : 0,
            'pending_permissions' => fn () => $request->user()?->role === 'guru_pembimbing'
                ? \App\Models\Attendance::whereHas('user', fn($q) => $q->where('mentor_teacher_id', $request->user()->id))
                    ->whereIn('status', ['izin', 'sakit'])
                    ->whereNull('is_approved')
                    ->with(['user.company', 'company'])
                    ->latest('date')
                    ->get()
                    ->map(fn($att) => [
                        'id' => $att->id,
                        'user_name' => $att->user?->name,
                        'class_name' => $att->user?->class_name,
                        'date_formatted' => $att->date instanceof \Carbon\Carbon ? $att->date->isoFormat('dddd, D MMMM Y') : \Carbon\Carbon::parse($att->date)->isoFormat('dddd, D MMMM Y'),
                        'status' => $att->status,
                        'permission_reason' => $att->permission_reason,
                        'permission_doc_url' => $att->permission_doc ? asset('storage/' . $att->permission_doc) : null,
                        'company_name' => $att->user?->company?->name ?? 'Belum Diplot',
                    ])
                : [],
        ];
    }
}
