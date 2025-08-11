<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class TenantService
{
    public function createTenant(array $data): Tenant
    {
        return DB::transaction(function () use ($data) {
            // Create tenant record
            $tenant = Tenant::create($data);

            // Create tenant database
            $this->createTenantDatabase($tenant);

            // Setup tenant-specific data
            $this->setupTenantData($tenant);

            return $tenant;
        });
    }

    public function deleteTenant(Tenant $tenant): void
    {
        DB::transaction(function () use ($tenant) {
            // Delete tenant database
            $this->deleteTenantDatabase($tenant);

            // Delete tenant record
            $tenant->delete();
        });
    }

    private function createTenantDatabase(Tenant $tenant): void
    {
        $databaseName = $tenant->database;
        
        // Create database
        DB::statement("CREATE DATABASE {$databaseName}");

        // Run migrations on tenant database
        $this->runTenantMigrations($tenant);
    }

    private function deleteTenantDatabase(Tenant $tenant): void
    {
        $databaseName = $tenant->database;
        
        // Drop database
        DB::statement("DROP DATABASE IF EXISTS {$databaseName}");
    }

    private function runTenantMigrations(Tenant $tenant): void
    {
        // Switch to tenant context
        $tenant->makeCurrent();

        // Run tenant-specific migrations
        \Artisan::call('migrate', [
            '--database' => 'tenant',
            '--path' => 'database/migrations/tenant',
            '--force' => true,
        ]);

        // Seed tenant data
        \Artisan::call('db:seed', [
            '--database' => 'tenant',
            '--class' => 'TenantSeeder',
            '--force' => true,
        ]);
    }

    private function setupTenantData(Tenant $tenant): void
    {
        $tenant->makeCurrent();

        // Create default roles for tenant
        $this->createTenantRoles();

        // Create tenant admin user
        $this->createTenantAdmin($tenant);

        // Setup default inventory categories
        $this->setupDefaultCategories();
    }

    private function createTenantRoles(): void
    {
        $roles = [
            'tenant-admin' => 'Tenant Administrator',
            'restaurant-manager' => 'Restaurant Manager',
            'restaurant-staff' => 'Restaurant Staff',
            'warehouse-manager' => 'Warehouse Manager',
            'warehouse-staff' => 'Warehouse Staff',
        ];

        foreach ($roles as $name => $displayName) {
            Role::firstOrCreate(
                ['name' => $name, 'guard_name' => 'web'],
                ['display_name' => $displayName]
            );
        }
    }

    private function createTenantAdmin(Tenant $tenant): User
    {
        $admin = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Tenant Administrator',
            'email' => 'admin@' . $tenant->domain,
            'password' => Hash::make(Str::random(12)),
            'email_verified_at' => now(),
            'is_active' => true,
        ]);

        $admin->assignRole('tenant-admin');

        return $admin;
    }

    private function setupDefaultCategories(): void
    {
        $categories = [
            ['name' => 'Vegetables', 'color' => '#10B981', 'icon' => 'leaf'],
            ['name' => 'Fruits', 'color' => '#F59E0B', 'icon' => 'apple'],
            ['name' => 'Meat & Poultry', 'color' => '#EF4444', 'icon' => 'meat'],
            ['name' => 'Seafood', 'color' => '#3B82F6', 'icon' => 'fish'],
            ['name' => 'Dairy', 'color' => '#8B5CF6', 'icon' => 'milk'],
            ['name' => 'Grains & Cereals', 'color' => '#F97316', 'icon' => 'grain'],
            ['name' => 'Beverages', 'color' => '#06B6D4', 'icon' => 'cup'],
            ['name' => 'Spices & Seasonings', 'color' => '#84CC16', 'icon' => 'spice'],
            ['name' => 'Cleaning Supplies', 'color' => '#6B7280', 'icon' => 'spray'],
            ['name' => 'Packaging', 'color' => '#A855F7', 'icon' => 'box'],
        ];

        foreach ($categories as $index => $category) {
            \App\Models\InventoryCategory::create([
                'name' => $category['name'],
                'slug' => Str::slug($category['name']),
                'color' => $category['color'],
                'icon' => $category['icon'],
                'sort_order' => $index + 1,
            ]);
        }
    }

    public function connectRestaurantToWarehouse(int $restaurantId, int $warehouseId, array $settings = []): void
    {
        DB::table('restaurant_warehouse_connections')->updateOrInsert(
            [
                'restaurant_id' => $restaurantId,
                'warehouse_id' => $warehouseId,
            ],
            [
                'is_active' => true,
                'priority' => $settings['priority'] ?? 1,
                'delivery_settings' => json_encode($settings['delivery_settings'] ?? []),
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );
    }

    public function disconnectRestaurantFromWarehouse(int $restaurantId, int $warehouseId): void
    {
        DB::table('restaurant_warehouse_connections')
            ->where('restaurant_id', $restaurantId)
            ->where('warehouse_id', $warehouseId)
            ->delete();
    }
}