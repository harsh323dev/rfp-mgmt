import express from 'express';
import { createRFPFromText, getAllRFPs, getRFPById } from '../controllers/rfpController';

const router = express.Router();

// Add middleware to log all requests to this router
router.use((req, res, next) => {
  console.log(`🔵 Route hit: ${req.method} ${req.originalUrl}`);
  console.log(`🔵 Body:`, req.body);
  next();
});

router.post('/create', createRFPFromText);
router.get('/', getAllRFPs);
router.get('/:id', getRFPById);

export default router;
    