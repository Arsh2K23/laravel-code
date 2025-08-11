<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Multitenancy\Models\Tenant as BaseTenant;

class Tenant extends BaseTenant
{
    use HasFactory;

    protected $fillable = [
        'name',
        'domain',
        'database',
        'type', // 'restaurant' or 'warehouse'
        'settings',
        'is_active',
        'subscription_plan',
        'subscription_expires_at',
        'created_by',
    ];

    protected $casts = [
        'settings' => 'array',
        'is_active' => 'boolean',
        'subscription_expires_at' => 'datetime',
    ];

    public function restaurants(): HasMany
    {
        return $this->hasMany(Restaurant::class);
    }

    public function warehouses(): HasMany
    {
        return $this->hasMany(Warehouse::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function connectedWarehouses(): BelongsToMany
    {
        return $this->belongsToMany(Warehouse::class, 'restaurant_warehouse_connections')
            ->withPivot(['is_active', 'priority', 'delivery_settings'])
            ->withTimestamps();
    }

    public function isRestaurant(): bool
    {
        return $this->type === 'restaurant';
    }

    public function isWarehouse(): bool
    {
        return $this->type === 'warehouse';
    }

    public function isActive(): bool
    {
        return $this->is_active && 
               ($this->subscription_expires_at === null || $this->subscription_expires_at->isFuture());
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