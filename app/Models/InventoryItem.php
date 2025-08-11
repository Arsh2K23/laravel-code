<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'sku',
        'barcode',
        'description',
        'unit_of_measure',
        'cost_price',
        'selling_price',
        'tax_rate',
        'image',
        'is_perishable',
        'shelf_life_days',
        'storage_requirements',
        'allergen_info',
        'nutritional_info',
        'supplier_info',
        'is_active',
    ];

    protected $casts = [
        'cost_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'is_perishable' => 'boolean',
        'shelf_life_days' => 'integer',
        'storage_requirements' => 'array',
        'allergen_info' => 'array',
        'nutritional_info' => 'array',
        'supplier_info' => 'array',
        'is_active' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(InventoryCategory::class, 'category_id');
    }

    public function restaurantInventories(): HasMany
    {
        return $this->hasMany(RestaurantInventory::class);
    }

    public function warehouseInventories(): HasMany
    {
        return $this->hasMany(WarehouseInventory::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(InventoryOrderItem::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function getFormattedCostPriceAttribute(): string
    {
        return number_format($this->cost_price, 2);
    }

    public function getFormattedSellingPriceAttribute(): string
    {
        return number_format($this->selling_price, 2);
    }

    public function isExpiringSoon(int $days = 7): bool
    {
        if (!$this->is_perishable || !$this->shelf_life_days) {
            return false;
        }

        return $this->shelf_life_days <= $days;
    }

    public function calculateTaxAmount(float $amount): float
    {
        return $amount * ($this->tax_rate / 100);
    }

    public function getTotalPriceWithTax(): float
    {
        return $this->selling_price + $this->calculateTaxAmount($this->selling_price);
    }
}