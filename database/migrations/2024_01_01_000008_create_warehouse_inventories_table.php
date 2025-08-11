<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warehouse_inventories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warehouse_id')->constrained()->onDelete('cascade');
            $table->foreignId('inventory_item_id')->constrained()->onDelete('cascade');
            $table->decimal('current_stock', 10, 2)->default(0);
            $table->decimal('reserved_stock', 10, 2)->default(0);
            $table->decimal('available_stock', 10, 2)->default(0);
            $table->decimal('minimum_stock', 10, 2)->default(0);
            $table->decimal('maximum_stock', 10, 2)->default(0);
            $table->decimal('reorder_point', 10, 2)->default(0);
            $table->decimal('reorder_quantity', 10, 2)->default(0);
            $table->date('last_restocked_date')->nullable();
            $table->json('batch_info')->nullable();
            $table->string('location')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['warehouse_id', 'inventory_item_id']);
            $table->index(['warehouse_id', 'is_active']);
            $table->index(['current_stock', 'minimum_stock']);
            $table->index('available_stock');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('warehouse_inventories');
    }
};