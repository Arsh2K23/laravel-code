import jwt from 'jsonwebtoken';
import { db } from '../database/init.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      tenantId: user.tenant_id,
      roles: user.roles || []
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get fresh user data
    const user = await db('users')
      .where('id', decoded.id)
      .where('is_active', true)
      .first();

    if (!user) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    // Parse JSON fields
    user.roles = JSON.parse(user.roles || '[]');
    user.permissions = JSON.parse(user.permissions || '[]');
    user.settings = JSON.parse(user.settings || '{}');

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userRoles = req.user.roles || [];
    const requiredRoles = Array.isArray(roles) ? roles : [roles];

    // Super admin can access everything
    if (userRoles.includes('super-admin')) {
      return next();
    }

    // Check if user has any of the required roles
    const hasRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
}

export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userPermissions = req.user.permissions || [];
    
    // Super admin or wildcard permission
    if (userPermissions.includes('*') || userPermissions.includes(permission)) {
      return next();
    }

    return res.status(403).json({ message: 'Insufficient permissions' });
  };
}