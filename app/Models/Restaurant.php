<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Restaurant extends Model
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
        'currency',
        'logo',
        'settings',
        'is_active',
        'manager_id',
    ];

    protected $casts = [
        'settings' => 'array',
        'is_active' => 'boolean',
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
        return $this->hasMany(RestaurantInventory::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(InventoryOrder::class);
    }

    public function connectedWarehouses(): BelongsToMany
    {
        return $this->belongsToMany(Warehouse::class, 'restaurant_warehouse_connections')
            ->withPivot(['is_active', 'priority', 'delivery_settings'])
            ->withTimestamps();
    }

    public function lowStockItems(): HasMany
    {
        return $this->inventoryItems()
            ->whereRaw('current_stock <= minimum_stock')
            ->where('is_active', true);
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