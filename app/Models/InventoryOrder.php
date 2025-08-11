<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryOrder extends Model
{
    use HasFactory;

    const STATUS_DRAFT = 'draft';
    const STATUS_PENDING = 'pending';
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_PREPARING = 'preparing';
    const STATUS_READY = 'ready';
    const STATUS_DISPATCHED = 'dispatched';
    const STATUS_DELIVERED = 'delivered';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_REJECTED = 'rejected';

    const PRIORITY_LOW = 'low';
    const PRIORITY_NORMAL = 'normal';
    const PRIORITY_HIGH = 'high';
    const PRIORITY_URGENT = 'urgent';

    protected $fillable = [
        'restaurant_id',
        'warehouse_id',
        'order_number',
        'status',
        'priority',
        'requested_delivery_date',
        'confirmed_delivery_date',
        'actual_delivery_date',
        'subtotal',
        'tax_amount',
        'total_amount',
        'notes',
        'internal_notes',
        'created_by',
        'processed_by',
        'cancelled_by',
        'cancellation_reason',
        'delivery_address',
        'delivery_instructions',
    ];

    protected $casts = [
        'requested_delivery_date' => 'datetime',
        'confirmed_delivery_date' => 'datetime',
        'actual_delivery_date' => 'datetime',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'delivery_address' => 'array',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InventoryOrderItem::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function canceller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class);
    }

    public static function getStatuses(): array
    {
        return [
            self::STATUS_DRAFT => 'Draft',
            self::STATUS_PENDING => 'Pending',
            self::STATUS_CONFIRMED => 'Confirmed',
            self::STATUS_PREPARING => 'Preparing',
            self::STATUS_READY => 'Ready',
            self::STATUS_DISPATCHED => 'Dispatched',
            self::STATUS_DELIVERED => 'Delivered',
            self::STATUS_CANCELLED => 'Cancelled',
            self::STATUS_REJECTED => 'Rejected',
        ];
    }

    public static function getPriorities(): array
    {
        return [
            self::PRIORITY_LOW => 'Low',
            self::PRIORITY_NORMAL => 'Normal',
            self::PRIORITY_HIGH => 'High',
            self::PRIORITY_URGENT => 'Urgent',
        ];
    }

    public function getStatusLabelAttribute(): string
    {
        return self::getStatuses()[$this->status] ?? $this->status;
    }

    public function getPriorityLabelAttribute(): string
    {
        return self::getPriorities()[$this->priority] ?? $this->priority;
    }

    public function isPending(): bool
    {
        return in_array($this->status, [self::STATUS_DRAFT, self::STATUS_PENDING]);
    }

    public function isConfirmed(): bool
    {
        return in_array($this->status, [
            self::STATUS_CONFIRMED,
            self::STATUS_PREPARING,
            self::STATUS_READY,
            self::STATUS_DISPATCHED,
        ]);
    }

    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_DELIVERED;
    }

    public function isCancelled(): bool
    {
        return in_array($this->status, [self::STATUS_CANCELLED, self::STATUS_REJECTED]);
    }

    public function canBeCancelled(): bool
    {
        return !in_array($this->status, [
            self::STATUS_DISPATCHED,
            self::STATUS_DELIVERED,
            self::STATUS_CANCELLED,
            self::STATUS_REJECTED,
        ]);
    }

    public function calculateTotals(): void
    {
        $subtotal = $this->items->sum(function ($item) {
            return $item->quantity * $item->unit_price;
        });

        $taxAmount = $this->items->sum(function ($item) {
            return $item->quantity * $item->unit_price * ($item->tax_rate / 100);
        });

        $this->update([
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total_amount' => $subtotal + $taxAmount,
        ]);
    }

    public function updateStatus(string $status, ?User $user = null, ?string $notes = null): void
    {
        $oldStatus = $this->status;
        
        $this->update(['status' => $status]);

        // Record status history
        $this->statusHistory()->create([
            'from_status' => $oldStatus,
            'to_status' => $status,
            'changed_by' => $user?->id,
            'notes' => $notes,
            'changed_at' => now(),
        ]);

        // Trigger events or notifications here
        event(new \App\Events\OrderStatusChanged($this, $oldStatus, $status, $user));
    }
}