export function up(knex) {
  return knex.schema.createTable('inventory_categories', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('slug').unique().notNullable();
    table.text('description');
    table.string('color', 7).defaultTo('#6B7280');
    table.string('icon');
    table.boolean('is_active').defaultTo(true);
    table.integer('sort_order').defaultTo(0);
    table.timestamps(true, true);

    table.index(['is_active', 'sort_order']);
  });
}

export function down(knex) {
  return knex.schema.dropTable('inventory_categories');
}