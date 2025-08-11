<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Warehouse extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'name',
        'slug',
        'email',
        'phone',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'timezone',
        'operating_hours',
        'delivery_radius',
        'settings',
        'is_active',
        'manager_id',
    ];

    protected $casts = [
        'operating_hours' => 'array',
        'settings' => 'array',
        'is_active' => 'boolean',
        'delivery_radius' => 'decimal:2',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function inventoryItems(): HasMany
    {
        return $this->hasMany(WarehouseInventory::class);
    }

    public function receivedOrders(): HasMany
    {
        return $this->hasMany(InventoryOrder::class);
    }

    public function connectedRestaurants(): BelongsToMany
    {
        return $this->belongsToMany(Restaurant::class, 'restaurant_warehouse_connections')
            ->withPivot(['is_active', 'priority', 'delivery_settings'])
            ->withTimestamps();
    }

    public function suppliers(): BelongsToMany
    {
        return $this->belongsToMany(Supplier::class, 'warehouse_suppliers')
            ->withPivot(['is_primary', 'payment_terms', 'delivery_terms'])
            ->withTimestamps();
    }

    public function isOperatingNow(): bool
    {
        $now = now($this->timezone ?? config('app.timezone'));
        $dayOfWeek = strtolower($now->format('l'));
        
        $todayHours = $this->operating_hours[$dayOfWeek] ?? null;
        
        if (!$todayHours || !$todayHours['is_open']) {
            return false;
        }

        $currentTime = $now->format('H:i');
        return $currentTime >= $todayHours['open'] && $currentTime <= $todayHours['close'];
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