<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompanyController extends Controller
{
    /**
     * Display a listing of the companies (DUDI).
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');

        $companies = Company::withCount(['users as students_count' => function ($query) {
            $query->where('role', 'siswa');
        }, 'users as mentors_count' => function ($query) {
            $query->where('role', 'pembimbing_dudi');
        }])
        ->when($search, function ($query, $search) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
        })
        ->latest()
        ->paginate(10)
        ->withQueryString();

        return Inertia::render('admin/companies/index', [
            'companies' => $companies,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created company.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius_meters' => 'required|integer|min:10|max:1000',
            'check_in_start' => 'required|date_format:H:i',
            'check_in_end' => 'required|date_format:H:i|after:check_in_start',
            'check_out_start' => 'required|date_format:H:i|after:check_in_start',
        ], [
            'check_in_end.after' => 'Jam batas masuk harus setelah jam mulai masuk.',
            'check_out_start.after' => 'Jam pulang harus setelah jam mulai masuk.',
        ]);

        Company::create($validated);

        return redirect()->back()->with('success', 'Data Perusahaan / DUDI berhasil ditambahkan.');
    }

    /**
     * Update the specified company.
     */
    public function update(Request $request, Company $company): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius_meters' => 'required|integer|min:10|max:1000',
            'check_in_start' => 'required|date_format:H:i',
            'check_in_end' => 'required|date_format:H:i|after:check_in_start',
            'check_out_start' => 'required|date_format:H:i|after:check_in_start',
        ], [
            'check_in_end.after' => 'Jam batas masuk harus setelah jam mulai masuk.',
            'check_out_start.after' => 'Jam pulang harus setelah jam mulai masuk.',
        ]);

        $company->update($validated);

        return redirect()->back()->with('success', 'Data Perusahaan / DUDI berhasil diperbarui.');
    }

    /**
     * Remove the specified company.
     */
    public function destroy(Company $company): RedirectResponse
    {
        $activeUsers = $company->users()->count();

        if ($activeUsers > 0) {
            return redirect()->back()->withErrors([
                'error' => 'Tidak dapat menghapus DUDI karena masih ada siswa atau pembimbing yang terdaftar.',
            ]);
        }

        $company->delete();

        return redirect()->back()->with('success', 'Data Perusahaan / DUDI berhasil dihapus.');
    }
}
