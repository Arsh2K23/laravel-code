<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'tenant_id',
        'restaurant_id',
        'warehouse_id',
        'name',
        'email',
        'phone',
        'avatar',
        'password',
        'is_active',
        'last_login_at',
        'email_verified_at',
        'settings',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
        'settings' => 'array',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function createdOrders(): HasMany
    {
        return $this->hasMany(InventoryOrder::class, 'created_by');
    }

    public function processedOrders(): HasMany
    {
        return $this->hasMany(InventoryOrder::class, 'processed_by');
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole('super-admin');
    }

    public function isTenantAdmin(): bool
    {
        return $this->hasRole('tenant-admin');
    }

    public function isRestaurantManager(): bool
    {
        return $this->hasRole('restaurant-manager');
    }

    public function isWarehouseManager(): bool
    {
        return $this->hasRole('warehouse-manager');
    }

    public function canAccessTenant(Tenant $tenant): bool
    {
        return $this->isSuperAdmin() || $this->tenant_id === $tenant->id;
    }

    public function canAccessRestaurant(Restaurant $restaurant): bool
    {
        return $this->isSuperAdmin() || 
               $this->isTenantAdmin() || 
               $this->restaurant_id === $restaurant->id;
    }

    public function canAccessWarehouse(Warehouse $warehouse): bool
    {
        return $this->isSuperAdmin() || 
               $this->isTenantAdmin() || 
               $this->warehouse_id === $warehouse->id;
    }

    public function getSettingValue(string $key, $default = null)
    {
        return data_get($this->settings, $key, $default);
    }

    public function updateSetting(string $key, $value): void
    {
        $settings = $this->settings ?? [];
        data_set($settings, $key, $value);
        $this->update(['settings' => $settings]);
    }
}