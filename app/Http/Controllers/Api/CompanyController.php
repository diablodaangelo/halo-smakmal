<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCompanyRequest;
use App\Http\Requests\UpdateCompanyRequest;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    /**
     * Display a listing of companies with search, pagination, and student count.
     */
    public function index(Request $request): JsonResponse
    {
        $companies = Company::query()
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->search;
                return $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('address', 'like', "%{$search}%");
                });
            })
            ->withCount(['users as students_count' => function ($query) {
                $query->where('role', 'siswa');
            }])
            ->latest()
            ->paginate($request->query('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $companies,
        ]);
    }

    /**
     * Store a newly created company in storage.
     */
    public function store(StoreCompanyRequest $request): JsonResponse
    {
        $company = Company::create($request->validated());

        return response()->json([
            'message' => 'Data instansi berhasil ditambahkan',
            'data' => $company,
        ], 201);
    }

    /**
     * Display the specified company with assigned students.
     */
    public function show(Company $company): JsonResponse
    {
        $company->load([
            'users' => function ($query) {
                $query->where('role', 'siswa');
            },
        ])->loadCount([
            'users as students_count' => function ($query) {
                $query->where('role', 'siswa');
            },
        ]);

        return response()->json([
            'data' => $company,
        ]);
    }

    /**
     * Update the specified company in storage.
     */
    public function update(UpdateCompanyRequest $request, Company $company): JsonResponse
    {
        $company->update($request->validated());

        return response()->json([
            'message' => 'Data instansi berhasil diperbarui',
            'data' => $company,
        ]);
    }

    /**
     * Remove the specified company from storage and detach assigned users.
     */
    public function destroy(Company $company): JsonResponse
    {
        // Detach students and users connected to this company to avoid dangling references
        $company->users()->update(['company_id' => null]);
        $company->delete();

        return response()->json([
            'message' => 'Data instansi berhasil dihapus',
        ]);
    }
}
