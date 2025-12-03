import express from 'express';
import { receiveProposals, getProposalsByRFP, getAllProposals, compareRFPProposals } from '../controllers/proposalController';

const router = express.Router();

router.post('/receive', receiveProposals);
router.get('/rfp/:rfpId', getProposalsByRFP);
router.get('/compare/:rfpId', compareRFPProposals);
router.get('/', getAllProposals);

export default router;
