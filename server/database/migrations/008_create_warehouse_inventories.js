export function up(knex) {
  return knex.schema.createTable('warehouse_inventories', (table) => {
    table.increments('id').primary();
    table.integer('warehouse_id').unsigned().references('id').inTable('warehouses').onDelete('CASCADE');
    table.integer('inventory_item_id').unsigned().references('id').inTable('inventory_items').onDelete('CASCADE');
    table.decimal('current_stock', 10, 2).defaultTo(0);
    table.decimal('reserved_stock', 10, 2).defaultTo(0);
    table.decimal('available_stock', 10, 2).defaultTo(0);
    table.decimal('minimum_stock', 10, 2).defaultTo(0);
    table.decimal('maximum_stock', 10, 2).defaultTo(0);
    table.decimal('reorder_point', 10, 2).defaultTo(0);
    table.decimal('reorder_quantity', 10, 2).defaultTo(0);
    table.date('last_restocked_date');
    table.json('batch_info');
    table.string('location');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);

    table.unique(['warehouse_id', 'inventory_item_id']);
    table.index(['warehouse_id', 'is_active']);
    table.index(['current_stock', 'minimum_stock']);
    table.index('available_stock');
  });
}

export function down(knex) {
  return knex.schema.dropTable('warehouse_inventories');
}