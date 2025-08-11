import express from 'express';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Apply warehouse role requirement
router.use(requireRole(['warehouse-manager', 'warehouse-staff', 'tenant-admin', 'super-admin']));

// Placeholder routes - to be implemented
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Warehouse dashboard endpoint' });
});

export default router;