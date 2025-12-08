// backend/src/routes/rfpRoutes.ts
import express from 'express';
import {
  createRFP,
  getAllRFPs,
  sendRFPToVendors,
  compareProposalsWithAI,
} from '../controllers/rfpController';

const router = express.Router();

router.post('/create', createRFP);
router.get('/', getAllRFPs);
router.post('/send', sendRFPToVendors);
router.post('/:id/compare', compareProposalsWithAI);

export default router;
