import express from 'express';
import {
  createRFP,
  getAllRFPs,
  sendRFPToVendors,
  compareProposalsWithAI,
} from '../controllers/rfpController';

const router = express.Router();

// Log all requests hitting this router
router.use((req, res, next) => {
  console.log(`🔵 Route hit: ${req.method} ${req.originalUrl}`);
  console.log('🔵 Body:', req.body);
  next();
});

// Create RFP with or without AI
router.post('/create', createRFP);

// List all RFPs
router.get('/', getAllRFPs);

// Send RFP emails to vendors
router.post('/send', sendRFPToVendors);

// Compare proposals for a given RFP with OpenAI
router.post('/:id/compare', compareProposalsWithAI);

export default router;
