import express from 'express';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Apply restaurant role requirement
router.use(requireRole(['restaurant-manager', 'restaurant-staff', 'tenant-admin', 'super-admin']));

// Placeholder routes - to be implemented
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Restaurant dashboard endpoint' });
});

export default router;