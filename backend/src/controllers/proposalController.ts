import { Request, Response } from 'express';
import Proposal from '../models/Proposal';
import RFP from '../models/RFP';
import { checkForVendorResponses } from '../services/emailReceiverService';
import { compareProposals } from '../services/aiService';

// Check inbox and process vendor responses
export const receiveProposals = async (req: Request, res: Response) => {
  try {
    console.log('📬 Checking for vendor responses...');
    
    const proposals = await checkForVendorResponses();

    res.json({
      message: `Found ${proposals.length} new proposal(s)`,
      proposals,
    });
  } catch (error: any) {
    console.error('❌ Error receiving proposals:', error);
    res.status(500).json({ message: 'Failed to receive proposals', error: error.message });
  }
};

// Get all proposals for an RFP
export const getProposalsByRFP = async (req: Request, res: Response) => {
  try {
    const { rfpId } = req.params;
    
    const proposals = await Proposal.find({ rfp: rfpId })
      .populate('vendor')
      .sort({ createdAt: -1 });

    res.json(proposals);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch proposals', error: error.message });
  }
};

// Get all proposals
export const getAllProposals = async (req: Request, res: Response) => {
  try {
    const proposals = await Proposal.find()
      .populate('rfp')
      .populate('vendor')
      .sort({ createdAt: -1 });

    res.json(proposals);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch proposals', error: error.message });
  }
};

// Compare proposals for an RFP using AI
export const compareRFPProposals = async (req: Request, res: Response) => {
  try {
    const { rfpId } = req.params;

    // Fetch RFP
    const rfp = await RFP.findById(rfpId);
    if (!rfp) {
      return res.status(404).json({ message: 'RFP not found' });
    }

    // Fetch all proposals for this RFP
    const proposals = await Proposal.find({ rfp: rfpId }).populate('vendor');

    if (proposals.length === 0) {
      return res.status(404).json({ message: 'No proposals found for this RFP' });
    }

    console.log(`🤖 Comparing ${proposals.length} proposals using AI...`);

    // Use AI to compare proposals
    const comparison = await compareProposals(rfp, proposals);

    res.json({
      message: 'Proposal comparison completed',
      rfp: {
        id: rfp._id,
        title: rfp.title,
        budget: rfp.budget,
      },
      proposalCount: proposals.length,
      comparison,
    });
  } catch (error: any) {
    console.error('❌ Error comparing proposals:', error);
    res.status(500).json({ message: 'Failed to compare proposals', error: error.message });
  }
};
