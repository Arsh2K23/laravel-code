import express from 'express';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Apply tenant admin role requirement
router.use(requireRole(['tenant-admin', 'super-admin']));

// Placeholder routes - to be implemented
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Tenant dashboard endpoint' });
});

export default router;