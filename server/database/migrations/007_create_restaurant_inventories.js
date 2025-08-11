export function up(knex) {
  return knex.schema.createTable('restaurant_inventories', (table) => {
    table.increments('id').primary();
    table.integer('restaurant_id').unsigned().references('id').inTable('restaurants').onDelete('CASCADE');
    table.integer('inventory_item_id').unsigned().references('id').inTable('inventory_items').onDelete('CASCADE');
    table.decimal('current_stock', 10, 2).defaultTo(0);
    table.decimal('minimum_stock', 10, 2).defaultTo(0);
    table.decimal('maximum_stock', 10, 2).defaultTo(0);
    table.decimal('reorder_point', 10, 2).defaultTo(0);
    table.decimal('reorder_quantity', 10, 2).defaultTo(0);
    table.decimal('average_daily_usage', 10, 2).defaultTo(0);
    table.date('last_restocked_date');
    table.date('expiry_date');
    table.string('location');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);

    table.unique(['restaurant_id', 'inventory_item_id']);
    table.index(['restaurant_id', 'is_active']);
    table.index(['current_stock', 'minimum_stock']);
    table.index('expiry_date');
  });
}

export function down(knex) {
  return knex.schema.dropTable('restaurant_inventories');
}