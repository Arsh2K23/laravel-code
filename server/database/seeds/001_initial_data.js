import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex) {
  // Clear existing data
  await knex('restaurant_warehouse_connections').del();
  await knex('inventory_order_items').del();
  await knex('inventory_orders').del();
  await knex('warehouse_inventories').del();
  await knex('restaurant_inventories').del();
  await knex('inventory_items').del();
  await knex('inventory_categories').del();
  await knex('warehouses').del();
  await knex('restaurants').del();
  await knex('users').del();
  await knex('tenants').del();

  // Create super admin tenant
  const [superAdminTenantId] = await knex('tenants').insert({
    name: 'System Administration',
    domain: 'admin.restaurant-inventory.local',
    database_name: 'system_admin',
    type: 'restaurant',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  });

  // Create demo tenant
  const [demoTenantId] = await knex('tenants').insert({
    name: 'Demo Restaurant Group',
    domain: 'demo.restaurant-inventory.local',
    database_name: 'demo_tenant',
    type: 'restaurant',
    is_active: true,
    subscription_plan: 'premium',
    subscription_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    created_at: new Date(),
    updated_at: new Date()
  });

  // Create super admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const [superAdminId] = await knex('users').insert({
    tenant_id: superAdminTenantId,
    name: 'Super Administrator',
    email: 'admin@restaurant-inventory.com',
    password: hashedPassword,
    is_active: true,
    roles: JSON.stringify(['super-admin']),
    permissions: JSON.stringify(['*']),
    created_at: new Date(),
    updated_at: new Date()
  });

  // Create demo tenant admin
  const [tenantAdminId] = await knex('users').insert({
    tenant_id: demoTenantId,
    name: 'Demo Tenant Admin',
    email: 'admin@demo.restaurant-inventory.local',
    password: hashedPassword,
    is_active: true,
    roles: JSON.stringify(['tenant-admin']),
    permissions: JSON.stringify(['tenant.*']),
    created_at: new Date(),
    updated_at: new Date()
  });

  // Create demo restaurant
  const [restaurantId] = await knex('restaurants').insert({
    tenant_id: demoTenantId,
    name: 'Demo Restaurant',
    slug: 'demo-restaurant',
    email: 'restaurant@demo.restaurant-inventory.local',
    phone: '+1-555-0123',
    address: '123 Main Street',
    city: 'Demo City',
    state: 'Demo State',
    country: 'USA',
    postal_code: '12345',
    timezone: 'America/New_York',
    currency: 'USD',
    is_active: true,
    manager_id: tenantAdminId,
    created_at: new Date(),
    updated_at: new Date()
  });

  // Create demo warehouse
  const [warehouseId] = await knex('warehouses').insert({
    tenant_id: demoTenantId,
    name: 'Demo Warehouse',
    slug: 'demo-warehouse',
    email: 'warehouse@demo.restaurant-inventory.local',
    phone: '+1-555-0124',
    address: '456 Industrial Blvd',
    city: 'Demo City',
    state: 'Demo State',
    country: 'USA',
    postal_code: '12346',
    timezone: 'America/New_York',
    operating_hours: JSON.stringify({
      monday: { is_open: true, open: '08:00', close: '18:00' },
      tuesday: { is_open: true, open: '08:00', close: '18:00' },
      wednesday: { is_open: true, open: '08:00', close: '18:00' },
      thursday: { is_open: true, open: '08:00', close: '18:00' },
      friday: { is_open: true, open: '08:00', close: '18:00' },
      saturday: { is_open: true, open: '09:00', close: '17:00' },
      sunday: { is_open: false, open: null, close: null }
    }),
    delivery_radius: 50.00,
    is_active: true,
    manager_id: tenantAdminId,
    created_at: new Date(),
    updated_at: new Date()
  });

  // Create restaurant manager
  const [restaurantManagerId] = await knex('users').insert({
    tenant_id: demoTenantId,
    restaurant_id: restaurantId,
    name: 'Restaurant Manager',
    email: 'manager@demo.restaurant-inventory.local',
    password: hashedPassword,
    is_active: true,
    roles: JSON.stringify(['restaurant-manager']),
    permissions: JSON.stringify(['restaurant.*']),
    created_at: new Date(),
    updated_at: new Date()
  });

  // Create warehouse manager
  const [warehouseManagerId] = await knex('users').insert({
    tenant_id: demoTenantId,
    warehouse_id: warehouseId,
    name: 'Warehouse Manager',
    email: 'warehouse@demo.restaurant-inventory.local',
    password: hashedPassword,
    is_active: true,
    roles: JSON.stringify(['warehouse-manager']),
    permissions: JSON.stringify(['warehouse.*']),
    created_at: new Date(),
    updated_at: new Date()
  });

  // Create inventory categories
  const categories = [
    { name: 'Vegetables', color: '#10B981', icon: 'leaf' },
    { name: 'Fruits', color: '#F59E0B', icon: 'apple' },
    { name: 'Meat & Poultry', color: '#EF4444', icon: 'meat' },
    { name: 'Seafood', color: '#3B82F6', icon: 'fish' },
    { name: 'Dairy', color: '#8B5CF6', icon: 'milk' },
    { name: 'Grains & Cereals', color: '#F97316', icon: 'grain' },
    { name: 'Beverages', color: '#06B6D4', icon: 'cup' },
    { name: 'Spices & Seasonings', color: '#84CC16', icon: 'spice' }
  ];

  const categoryIds = [];
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const [categoryId] = await knex('inventory_categories').insert({
      name: category.name,
      slug: category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      color: category.color,
      icon: category.icon,
      sort_order: i + 1,
      created_at: new Date(),
      updated_at: new Date()
    });
    categoryIds.push(categoryId);
  }

  // Create sample inventory items
  const items = [
    { name: 'Tomatoes', category: 0, sku: 'VEG-001', cost: 2.50, selling: 3.50, perishable: true, shelf_life: 7 },
    { name: 'Onions', category: 0, sku: 'VEG-002', cost: 1.20, selling: 2.00, perishable: true, shelf_life: 14 },
    { name: 'Apples', category: 1, sku: 'FRT-001', cost: 3.00, selling: 4.50, perishable: true, shelf_life: 21 },
    { name: 'Chicken Breast', category: 2, sku: 'MET-001', cost: 8.50, selling: 12.00, perishable: true, shelf_life: 3 },
    { name: 'Salmon Fillet', category: 3, sku: 'SEA-001', cost: 15.00, selling: 22.00, perishable: true, shelf_life: 2 },
    { name: 'Milk', category: 4, sku: 'DAI-001', cost: 3.50, selling: 5.00, perishable: true, shelf_life: 7 },
    { name: 'Rice', category: 5, sku: 'GRA-001', cost: 2.00, selling: 3.50, perishable: false, shelf_life: 365 },
    { name: 'Black Pepper', category: 7, sku: 'SPI-001', cost: 12.00, selling: 18.00, perishable: false, shelf_life: 730 }
  ];

  const itemIds = [];
  for (const item of items) {
    const [itemId] = await knex('inventory_items').insert({
      category_id: categoryIds[item.category],
      name: item.name,
      slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sku: item.sku,
      unit_of_measure: 'kg',
      cost_price: item.cost,
      selling_price: item.selling,
      tax_rate: 8.5,
      is_perishable: item.perishable,
      shelf_life_days: item.shelf_life,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    });
    itemIds.push(itemId);
  }

  // Create warehouse inventory
  for (const itemId of itemIds) {
    await knex('warehouse_inventories').insert({
      warehouse_id: warehouseId,
      inventory_item_id: itemId,
      current_stock: Math.floor(Math.random() * 1000) + 100,
      reserved_stock: 0,
      available_stock: Math.floor(Math.random() * 1000) + 100,
      minimum_stock: 50,
      maximum_stock: 1000,
      reorder_point: 100,
      reorder_quantity: 500,
      last_restocked_date: new Date(),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  // Create restaurant inventory
  for (const itemId of itemIds) {
    await knex('restaurant_inventories').insert({
      restaurant_id: restaurantId,
      inventory_item_id: itemId,
      current_stock: Math.floor(Math.random() * 50) + 5,
      minimum_stock: 10,
      maximum_stock: 100,
      reorder_point: 15,
      reorder_quantity: 50,
      average_daily_usage: Math.floor(Math.random() * 5) + 1,
      last_restocked_date: new Date(),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  // Connect restaurant to warehouse
  await knex('restaurant_warehouse_connections').insert({
    restaurant_id: restaurantId,
    warehouse_id: warehouseId,
    is_active: true,
    priority: 1,
    delivery_settings: JSON.stringify({
      delivery_fee: 25.00,
      minimum_order: 100.00,
      delivery_time: '2-4 hours'
    }),
    created_at: new Date(),
    updated_at: new Date()
  });

  console.log('Database seeded successfully!');
  console.log('Super Admin: admin@restaurant-inventory.com / admin123');
  console.log('Tenant Admin: admin@demo.restaurant-inventory.local / admin123');
  console.log('Restaurant Manager: manager@demo.restaurant-inventory.local / admin123');
  console.log('Warehouse Manager: warehouse@demo.restaurant-inventory.local / admin123');
}