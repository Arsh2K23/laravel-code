<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Services\TenantService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class TenantController extends Controller
{
    public function __construct(
        private TenantService $tenantService
    ) {
        $this->middleware('auth:sanctum');
        $this->middleware('role:super-admin');
    }

    public function index(Request $request): JsonResponse
    {
        $query = Tenant::with(['restaurants', 'warehouses', 'users'])
            ->withCount(['restaurants', 'warehouses', 'users']);

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('domain', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $tenants = $query->orderBy('created_at', 'desc')
                        ->paginate($request->get('per_page', 15));

        return response()->json($tenants);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'domain' => 'required|string|unique:tenants,domain',
            'type' => ['required', Rule::in(['restaurant', 'warehouse'])],
            'subscription_plan' => 'nullable|string',
            'subscription_expires_at' => 'nullable|date',
            'settings' => 'nullable|array',
        ]);

        $validated['database'] = 'tenant_' . str_replace(['.', '-'], '_', $validated['domain']);
        $validated['created_by'] = auth()->id();

        $tenant = $this->tenantService->createTenant($validated);

        return response()->json([
            'message' => 'Tenant created successfully',
            'tenant' => $tenant->load(['restaurants', 'warehouses', 'users'])
        ], 201);
    }

    public function show(Tenant $tenant): JsonResponse
    {
        $tenant->load([
            'restaurants.manager',
            'warehouses.manager',
            'users.roles'
        ]);

        return response()->json($tenant);
    }

    public function update(Request $request, Tenant $tenant): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'domain' => ['sometimes', 'string', Rule::unique('tenants')->ignore($tenant->id)],
            'type' => ['sometimes', Rule::in(['restaurant', 'warehouse'])],
            'is_active' => 'sometimes|boolean',
            'subscription_plan' => 'nullable|string',
            'subscription_expires_at' => 'nullable|date',
            'settings' => 'nullable|array',
        ]);

        $tenant->update($validated);

        return response()->json([
            'message' => 'Tenant updated successfully',
            'tenant' => $tenant->fresh()->load(['restaurants', 'warehouses', 'users'])
        ]);
    }

    public function destroy(Tenant $tenant): JsonResponse
    {
        if ($tenant->restaurants()->count() > 0 || $tenant->warehouses()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete tenant with active restaurants or warehouses'
            ], 422);
        }

        $this->tenantService->deleteTenant($tenant);

        return response()->json([
            'message' => 'Tenant deleted successfully'
        ]);
    }

    public function activate(Tenant $tenant): JsonResponse
    {
        $tenant->update(['is_active' => true]);

        return response()->json([
            'message' => 'Tenant activated successfully',
            'tenant' => $tenant
        ]);
    }

    public function deactivate(Tenant $tenant): JsonResponse
    {
        $tenant->update(['is_active' => false]);

        return response()->json([
            'message' => 'Tenant deactivated successfully',
            'tenant' => $tenant
        ]);
    }

    public function stats(): JsonResponse
    {
        $stats = [
            'total_tenants' => Tenant::count(),
            'active_tenants' => Tenant::where('is_active', true)->count(),
            'restaurants' => Tenant::where('type', 'restaurant')->count(),
            'warehouses' => Tenant::where('type', 'warehouse')->count(),
            'recent_tenants' => Tenant::where('created_at', '>=', now()->subDays(30))->count(),
        ];

        return response()->json($stats);
    }
}