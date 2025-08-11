<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_order_id')->constrained()->onDelete('cascade');
            $table->foreignId('inventory_item_id')->constrained()->onDelete('cascade');
            $table->decimal('quantity_requested', 10, 2);
            $table->decimal('quantity_confirmed', 10, 2)->default(0);
            $table->decimal('quantity_delivered', 10, 2)->default(0);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->decimal('line_total', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->json('batch_info')->nullable();
            $table->date('expiry_date')->nullable();
            $table->timestamps();

            $table->index(['inventory_order_id', 'inventory_item_id']);
            $table->index('expiry_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_order_items');
    }
};