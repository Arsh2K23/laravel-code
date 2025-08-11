import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../database/init.js';
import { requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Apply super admin role requirement to all routes
router.use(requireRole('super-admin'));

// Get dashboard stats
router.get('/stats', async (req, res, next) => {
  try {
    const [
      totalTenants,
      activeTenants,
      restaurants,
      warehouses,
      recentTenants
    ] = await Promise.all([
      db('tenants').count('id as count').first(),
      db('tenants').where('is_active', true).count('id as count').first(),
      db('restaurants').count('id as count').first(),
      db('warehouses').count('id as count').first(),
      db('tenants').where('created_at', '>=', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).count('id as count').first()
    ]);

    res.json({
      success: true,
      total_tenants: totalTenants.count,
      active_tenants: activeTenants.count,
      restaurants: restaurants.count,
      warehouses: warehouses.count,
      recent_tenants: recentTenants.count
    });
  } catch (error) {
    next(error);
  }
});

// Get all tenants
router.get('/tenants', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 15;
    const search = req.query.search;
    const type = req.query.type;
    const status = req.query.status;

    let query = db('tenants').select('*');

    // Apply filters
    if (search) {
      query = query.where(function() {
        this.where('name', 'like', `%${search}%`)
            .orWhere('domain', 'like', `%${search}%`);
      });
    }

    if (type) {
      query = query.where('type', type);
    }

    if (status) {
      query = query.where('is_active', status === 'active');
    }

    // Get total count
    const totalQuery = query.clone();
    const total = await totalQuery.count('id as count').first();

    // Get paginated results
    const tenants = await query
      .orderBy('created_at', 'desc')
      .limit(perPage)
      .offset((page - 1) * perPage);

    // Parse JSON fields
    tenants.forEach(tenant => {
      tenant.settings = JSON.parse(tenant.settings || '{}');
    });

    // Get counts for each tenant
    for (const tenant of tenants) {
      const [restaurantCount, warehouseCount, userCount] = await Promise.all([
        db('restaurants').where('tenant_id', tenant.id).count('id as count').first(),
        db('warehouses').where('tenant_id', tenant.id).count('id as count').first(),
        db('users').where('tenant_id', tenant.id).count('id as count').first()
      ]);

      tenant.restaurants_count = restaurantCount.count;
      tenant.warehouses_count = warehouseCount.count;
      tenant.users_count = userCount.count;
    }

    res.json({
      success: true,
      data: tenants,
      meta: {
        current_page: page,
        per_page: perPage,
        total: total.count,
        last_page: Math.ceil(total.count / perPage)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create tenant
router.post('/tenants', [
  body('name').notEmpty().trim(),
  body('domain').notEmpty().trim(),
  body('type').isIn(['restaurant', 'warehouse'])
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, domain, type, subscription_plan, subscription_expires_at, settings } = req.body;

    // Check if domain already exists
    const existingTenant = await db('tenants').where('domain', domain).first();
    if (existingTenant) {
      return res.status(409).json({
        success: false,
        message: 'Domain already exists'
      });
    }

    const tenantData = {
      name,
      domain,
      database_name: `tenant_${domain.replace(/[^a-zA-Z0-9]/g, '_')}`,
      type,
      subscription_plan,
      subscription_expires_at: subscription_expires_at ? new Date(subscription_expires_at) : null,
      settings: JSON.stringify(settings || {}),
      created_by: req.user.id,
      created_at: new Date(),
      updated_at: new Date()
    };

    const [tenantId] = await db('tenants').insert(tenantData);
    const tenant = await db('tenants').where('id', tenantId).first();
    tenant.settings = JSON.parse(tenant.settings || '{}');

    res.status(201).json({
      success: true,
      message: 'Tenant created successfully',
      tenant
    });
  } catch (error) {
    next(error);
  }
});

// Get single tenant
router.get('/tenants/:id', async (req, res, next) => {
  try {
    const tenant = await db('tenants').where('id', req.params.id).first();
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    tenant.settings = JSON.parse(tenant.settings || '{}');

    // Get related data
    const [restaurants, warehouses, users] = await Promise.all([
      db('restaurants').where('tenant_id', tenant.id),
      db('warehouses').where('tenant_id', tenant.id),
      db('users').where('tenant_id', tenant.id).select('id', 'name', 'email', 'roles', 'is_active', 'created_at')
    ]);

    // Parse JSON fields
    restaurants.forEach(restaurant => {
      restaurant.settings = JSON.parse(restaurant.settings || '{}');
    });

    warehouses.forEach(warehouse => {
      warehouse.settings = JSON.parse(warehouse.settings || '{}');
      warehouse.operating_hours = JSON.parse(warehouse.operating_hours || '{}');
    });

    users.forEach(user => {
      user.roles = JSON.parse(user.roles || '[]');
    });

    tenant.restaurants = restaurants;
    tenant.warehouses = warehouses;
    tenant.users = users;

    res.json({
      success: true,
      tenant
    });
  } catch (error) {
    next(error);
  }
});

// Update tenant
router.put('/tenants/:id', [
  body('name').optional().notEmpty().trim(),
  body('domain').optional().notEmpty().trim(),
  body('type').optional().isIn(['restaurant', 'warehouse'])
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const tenant = await db('tenants').where('id', req.params.id).first();
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    const { name, domain, type, is_active, subscription_plan, subscription_expires_at, settings } = req.body;

    // Check if domain already exists (excluding current tenant)
    if (domain && domain !== tenant.domain) {
      const existingTenant = await db('tenants').where('domain', domain).whereNot('id', req.params.id).first();
      if (existingTenant) {
        return res.status(409).json({
          success: false,
          message: 'Domain already exists'
        });
      }
    }

    const updateData = {
      updated_at: new Date()
    };

    if (name !== undefined) updateData.name = name;
    if (domain !== undefined) updateData.domain = domain;
    if (type !== undefined) updateData.type = type;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (subscription_plan !== undefined) updateData.subscription_plan = subscription_plan;
    if (subscription_expires_at !== undefined) updateData.subscription_expires_at = subscription_expires_at ? new Date(subscription_expires_at) : null;
    if (settings !== undefined) updateData.settings = JSON.stringify(settings);

    await db('tenants').where('id', req.params.id).update(updateData);
    
    const updatedTenant = await db('tenants').where('id', req.params.id).first();
    updatedTenant.settings = JSON.parse(updatedTenant.settings || '{}');

    res.json({
      success: true,
      message: 'Tenant updated successfully',
      tenant: updatedTenant
    });
  } catch (error) {
    next(error);
  }
});

// Delete tenant
router.delete('/tenants/:id', async (req, res, next) => {
  try {
    const tenant = await db('tenants').where('id', req.params.id).first();
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    // Check if tenant has restaurants or warehouses
    const [restaurantCount, warehouseCount] = await Promise.all([
      db('restaurants').where('tenant_id', req.params.id).count('id as count').first(),
      db('warehouses').where('tenant_id', req.params.id).count('id as count').first()
    ]);

    if (restaurantCount.count > 0 || warehouseCount.count > 0) {
      return res.status(422).json({
        success: false,
        message: 'Cannot delete tenant with active restaurants or warehouses'
      });
    }

    await db('tenants').where('id', req.params.id).del();

    res.json({
      success: true,
      message: 'Tenant deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Activate tenant
router.post('/tenants/:id/activate', async (req, res, next) => {
  try {
    const tenant = await db('tenants').where('id', req.params.id).first();
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    await db('tenants').where('id', req.params.id).update({
      is_active: true,
      updated_at: new Date()
    });

    const updatedTenant = await db('tenants').where('id', req.params.id).first();
    updatedTenant.settings = JSON.parse(updatedTenant.settings || '{}');

    res.json({
      success: true,
      message: 'Tenant activated successfully',
      tenant: updatedTenant
    });
  } catch (error) {
    next(error);
  }
});

// Deactivate tenant
router.post('/tenants/:id/deactivate', async (req, res, next) => {
  try {
    const tenant = await db('tenants').where('id', req.params.id).first();
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    await db('tenants').where('id', req.params.id).update({
      is_active: false,
      updated_at: new Date()
    });

    const updatedTenant = await db('tenants').where('id', req.params.id).first();
    updatedTenant.settings = JSON.parse(updatedTenant.settings || '{}');

    res.json({
      success: true,
      message: 'Tenant deactivated successfully',
      tenant: updatedTenant
    });
  } catch (error) {
    next(error);
  }
});

export default router;