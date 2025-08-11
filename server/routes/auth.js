import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { db } from '../database/init.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
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

    const { email, password } = req.body;

    // Find user
    const user = await db('users')
      .where('email', email)
      .where('is_active', true)
      .first();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await db('users')
      .where('id', user.id)
      .update({ last_login_at: new Date() });

    // Parse JSON fields
    user.roles = JSON.parse(user.roles || '[]');
    user.permissions = JSON.parse(user.permissions || '[]');
    user.settings = JSON.parse(user.settings || '{}');

    // Get tenant info
    let tenant = null;
    if (user.tenant_id) {
      tenant = await db('tenants').where('id', user.tenant_id).first();
      if (tenant) {
        tenant.settings = JSON.parse(tenant.settings || '{}');
      }
    }

    // Get restaurant info
    let restaurant = null;
    if (user.restaurant_id) {
      restaurant = await db('restaurants').where('id', user.restaurant_id).first();
      if (restaurant) {
        restaurant.settings = JSON.parse(restaurant.settings || '{}');
      }
    }

    // Get warehouse info
    let warehouse = null;
    if (user.warehouse_id) {
      warehouse = await db('warehouses').where('id', user.warehouse_id).first();
      if (warehouse) {
        warehouse.settings = JSON.parse(warehouse.settings || '{}');
        warehouse.operating_hours = JSON.parse(warehouse.operating_hours || '{}');
      }
    }

    // Generate token
    const token = generateToken(user);

    // Remove password from response
    delete user.password;

    res.json({
      success: true,
      message: 'Login successful',
      user,
      tenant,
      restaurant,
      warehouse,
      token
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const user = { ...req.user };
    delete user.password;

    // Get tenant info
    let tenant = null;
    if (user.tenant_id) {
      tenant = await db('tenants').where('id', user.tenant_id).first();
      if (tenant) {
        tenant.settings = JSON.parse(tenant.settings || '{}');
      }
    }

    // Get restaurant info
    let restaurant = null;
    if (user.restaurant_id) {
      restaurant = await db('restaurants').where('id', user.restaurant_id).first();
      if (restaurant) {
        restaurant.settings = JSON.parse(restaurant.settings || '{}');
      }
    }

    // Get warehouse info
    let warehouse = null;
    if (user.warehouse_id) {
      warehouse = await db('warehouses').where('id', user.warehouse_id).first();
      if (warehouse) {
        warehouse.settings = JSON.parse(warehouse.settings || '{}');
        warehouse.operating_hours = JSON.parse(warehouse.operating_hours || '{}');
      }
    }

    res.json({
      success: true,
      user,
      tenant,
      restaurant,
      warehouse
    });
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

export default router;