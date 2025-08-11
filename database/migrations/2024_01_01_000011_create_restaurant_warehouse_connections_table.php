<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurant_warehouse_connections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->onDelete('cascade');
            $table->foreignId('warehouse_id')->constrained()->onDelete('cascade');
            $table->boolean('is_active')->default(true);
            $table->integer('priority')->default(1);
            $table->json('delivery_settings')->nullable();
            $table->timestamps();

            $table->unique(['restaurant_id', 'warehouse_id']);
            $table->index(['restaurant_id', 'is_active', 'priority']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurant_warehouse_connections');
    }
};