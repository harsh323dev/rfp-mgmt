import express from 'express';
import {
  createRFP,
  getAllRFPs,
  sendRFPToVendors,
} from '../controllers/rfpController';

const router = express.Router();

// Add middleware to log all requests to this router
router.use((req, res, next) => {
  console.log(`🔵 Route hit: ${req.method} ${req.originalUrl}`);
  console.log('🔵 Body:', req.body);
  next();
});

router.post('/create', createRFP);
router.get('/', getAllRFPs);
router.post('/send', sendRFPToVendors);

export default router;
