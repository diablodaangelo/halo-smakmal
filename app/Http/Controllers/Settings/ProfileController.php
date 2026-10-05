<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user()->load('company');

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'nickname' => $user->nickname,
                'email' => $user->email,
                'role' => $user->role,
                'nis_nip' => $user->nis_nip,
                'phone' => $user->phone,
                'avatar_url' => $user->avatar ? asset('storage/' . $user->avatar) : null,
                'company_name' => $user->company?->name,
            ],
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $rules = [
            'nickname' => 'nullable|string|max:50',
            'phone' => 'nullable|string|max:25',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
        ];

        // Only admin can change official name & email
        if ($user->role === 'admin') {
            $rules['name'] = 'required|string|max:255';
            $rules['email'] = ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)];
        }

        $validated = $request->validate($rules, [
            'nickname.max' => 'Nama panggilan maksimal 50 karakter.',
            'avatar.image' => 'File foto profil harus berupa gambar.',
            'avatar.max' => 'Ukuran foto profil maksimal 4 MB.',
        ]);

        if ($user->role === 'admin') {
            $user->name = $validated['name'];
            if ($user->email !== $validated['email']) {
                $user->email = $validated['email'];
                $user->email_verified_at = null;
            }
        }

        $user->nickname = $validated['nickname'] ?? null;
        if (isset($validated['phone'])) {
            $user->phone = $validated['phone'];
        }

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            $user->avatar = $request->file('avatar')->store('avatars', 'public');
        }

        $user->save();

        return redirect()->back()->with('success', 'Profil berhasil diperbarui.');
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
