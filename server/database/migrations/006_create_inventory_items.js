export function up(knex) {
  return knex.schema.createTable('inventory_items', (table) => {
    table.increments('id').primary();
    table.integer('category_id').unsigned().references('id').inTable('inventory_categories').onDelete('CASCADE');
    table.string('name').notNullable();
    table.string('slug').unique().notNullable();
    table.string('sku').unique().notNullable();
    table.string('barcode').unique();
    table.text('description');
    table.string('unit_of_measure').defaultTo('piece');
    table.decimal('cost_price', 10, 2).defaultTo(0);
    table.decimal('selling_price', 10, 2).defaultTo(0);
    table.decimal('tax_rate', 5, 2).defaultTo(0);
    table.string('image');
    table.boolean('is_perishable').defaultTo(false);
    table.integer('shelf_life_days');
    table.json('storage_requirements');
    table.json('allergen_info');
    table.json('nutritional_info');
    table.json('supplier_info');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    table.datetime('deleted_at');

    table.index(['category_id', 'is_active']);
    table.index('sku');
    table.index('barcode');
    table.index('is_perishable');
  });
}

export function down(knex) {
  return knex.schema.dropTable('inventory_items');
}