export function up(knex) {
  return knex.schema.createTable('inventory_orders', (table) => {
    table.increments('id').primary();
    table.integer('restaurant_id').unsigned().references('id').inTable('restaurants').onDelete('CASCADE');
    table.integer('warehouse_id').unsigned().references('id').inTable('warehouses').onDelete('CASCADE');
    table.string('order_number').unique().notNullable();
    table.enum('status', [
      'draft', 'pending', 'confirmed', 'preparing', 
      'ready', 'dispatched', 'delivered', 'cancelled', 'rejected'
    ]).defaultTo('draft');
    table.enum('priority', ['low', 'normal', 'high', 'urgent']).defaultTo('normal');
    table.datetime('requested_delivery_date');
    table.datetime('confirmed_delivery_date');
    table.datetime('actual_delivery_date');
    table.decimal('subtotal', 10, 2).defaultTo(0);
    table.decimal('tax_amount', 10, 2).defaultTo(0);
    table.decimal('total_amount', 10, 2).defaultTo(0);
    table.text('notes');
    table.text('internal_notes');
    table.integer('created_by').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.integer('processed_by').unsigned().references('id').inTable('users');
    table.integer('cancelled_by').unsigned().references('id').inTable('users');
    table.text('cancellation_reason');
    table.json('delivery_address');
    table.text('delivery_instructions');
    table.timestamps(true, true);

    table.index(['restaurant_id', 'status']);
    table.index(['warehouse_id', 'status']);
    table.index('order_number');
    table.index(['status', 'priority']);
    table.index('requested_delivery_date');
  });
}

export function down(knex) {
  return knex.schema.dropTable('inventory_orders');
}