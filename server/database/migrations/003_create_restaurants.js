export function up(knex) {
  return knex.schema.createTable('restaurants', (table) => {
    table.increments('id').primary();
    table.integer('tenant_id').unsigned().references('id').inTable('tenants').onDelete('CASCADE');
    table.string('name').notNullable();
    table.string('slug').unique().notNullable();
    table.string('email');
    table.string('phone');
    table.text('address');
    table.string('city');
    table.string('state');
    table.string('country');
    table.string('postal_code');
    table.string('timezone').defaultTo('UTC');
    table.string('currency', 3).defaultTo('USD');
    table.string('logo');
    table.json('settings');
    table.boolean('is_active').defaultTo(true);
    table.integer('manager_id').unsigned();
    table.timestamps(true, true);
    table.datetime('deleted_at');

    table.index(['tenant_id', 'is_active']);
    table.index('slug');
  });
}

export function down(knex) {
  return knex.schema.dropTable('restaurants');
}