export function up(knex) {
  return knex.schema.createTable('restaurant_warehouse_connections', (table) => {
    table.increments('id').primary();
    table.integer('restaurant_id').unsigned().references('id').inTable('restaurants').onDelete('CASCADE');
    table.integer('warehouse_id').unsigned().references('id').inTable('warehouses').onDelete('CASCADE');
    table.boolean('is_active').defaultTo(true);
    table.integer('priority').defaultTo(1);
    table.json('delivery_settings');
    table.timestamps(true, true);

    table.unique(['restaurant_id', 'warehouse_id']);
    table.index(['restaurant_id', 'is_active', 'priority']);
  });
}

export function down(knex) {
  return knex.schema.dropTable('restaurant_warehouse_connections');
}