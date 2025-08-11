<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->onDelete('cascade');
            $table->foreignId('warehouse_id')->constrained()->onDelete('cascade');
            $table->string('order_number')->unique();
            $table->enum('status', [
                'draft', 'pending', 'confirmed', 'preparing', 
                'ready', 'dispatched', 'delivered', 'cancelled', 'rejected'
            ])->default('draft');
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->datetime('requested_delivery_date')->nullable();
            $table->datetime('confirmed_delivery_date')->nullable();
            $table->datetime('actual_delivery_date')->nullable();
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->text('internal_notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('cancellation_reason')->nullable();
            $table->json('delivery_address')->nullable();
            $table->text('delivery_instructions')->nullable();
            $table->timestamps();

            $table->index(['restaurant_id', 'status']);
            $table->index(['warehouse_id', 'status']);
            $table->index('order_number');
            $table->index(['status', 'priority']);
            $table->index('requested_delivery_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_orders');
    }
};