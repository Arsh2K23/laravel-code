export function up(knex) {
  return knex.schema.createTable('inventory_order_items', (table) => {
    table.increments('id').primary();
    table.integer('inventory_order_id').unsigned().references('id').inTable('inventory_orders').onDelete('CASCADE');
    table.integer('inventory_item_id').unsigned().references('id').inTable('inventory_items').onDelete('CASCADE');
    table.decimal('quantity_requested', 10, 2).notNullable();
    table.decimal('quantity_confirmed', 10, 2).defaultTo(0);
    table.decimal('quantity_delivered', 10, 2).defaultTo(0);
    table.decimal('unit_price', 10, 2).notNullable();
    table.decimal('tax_rate', 5, 2).defaultTo(0);
    table.decimal('line_total', 10, 2).defaultTo(0);
    table.text('notes');
    table.json('batch_info');
    table.date('expiry_date');
    table.timestamps(true, true);

    table.index(['inventory_order_id', 'inventory_item_id']);
    table.index('expiry_date');
  });
}

export function down(knex) {
  return knex.schema.dropTable('inventory_order_items');
}