export function up(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.integer('tenant_id').unsigned().references('id').inTable('tenants').onDelete('CASCADE');
    table.integer('restaurant_id').unsigned();
    table.integer('warehouse_id').unsigned();
    table.string('name').notNullable();
    table.string('email').unique().notNullable();
    table.string('phone');
    table.string('avatar');
    table.string('password').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.datetime('last_login_at');
    table.json('settings');
    table.json('roles').defaultTo('[]');
    table.json('permissions').defaultTo('[]');
    table.timestamps(true, true);

    table.index(['tenant_id', 'is_active']);
    table.index(['restaurant_id', 'is_active']);
    table.index(['warehouse_id', 'is_active']);
  });
}

export function down(knex) {
  return knex.schema.dropTable('users');
}