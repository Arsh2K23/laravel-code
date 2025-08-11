export function up(knex) {
  return knex.schema.createTable('tenants', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('domain').unique().notNullable();
    table.string('database_name').notNullable();
    table.enum('type', ['restaurant', 'warehouse']).defaultTo('restaurant');
    table.json('settings');
    table.boolean('is_active').defaultTo(true);
    table.string('subscription_plan');
    table.datetime('subscription_expires_at');
    table.integer('created_by').unsigned();
    table.timestamps(true, true);

    table.index(['domain', 'is_active']);
    table.index('type');
  });
}

export function down(knex) {
  return knex.schema.dropTable('tenants');
}