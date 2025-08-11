<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('inventory_categories')->onDelete('cascade');
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('sku')->unique();
            $table->string('barcode')->nullable()->unique();
            $table->text('description')->nullable();
            $table->string('unit_of_measure')->default('piece');
            $table->decimal('cost_price', 10, 2)->default(0);
            $table->decimal('selling_price', 10, 2)->default(0);
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->string('image')->nullable();
            $table->boolean('is_perishable')->default(false);
            $table->integer('shelf_life_days')->nullable();
            $table->json('storage_requirements')->nullable();
            $table->json('allergen_info')->nullable();
            $table->json('nutritional_info')->nullable();
            $table->json('supplier_info')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['category_id', 'is_active']);
            $table->index('sku');
            $table->index('barcode');
            $table->index('is_perishable');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};