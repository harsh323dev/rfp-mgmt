import { Request, Response } from 'express';
import RFP from '../models/RFP';
import Vendor from '../models/Vendor';
import Proposal from '../models/Proposal';
import { extractRFPFromText, compareProposals } from '../services/aiService';
import { sendRFPEmail } from '../services/emailService';

// Create RFP from natural language input (Gemini)
export const createRFP = async (req: Request, res: Response) => {
  try {
    console.log('📨 Request received at /api/rfps/create');
    console.log('📝 Request body:', req.body);

    const { naturalLanguageInput } = req.body as { naturalLanguageInput?: string };

    if (!naturalLanguageInput || naturalLanguageInput.trim().length === 0) {
      console.log('❌ No text provided');
      return res.status(400).json({ message: 'No text provided' });
    }

    const rfpData = await extractRFPFromText(naturalLanguageInput);
    const rfp: any = await RFP.create(rfpData);

    console.log('✅ RFP created:', rfp._id?.toString?.() ?? rfp._id);

    return res.status(201).json({
      message: 'RFP created successfully',
      rfp,
    });
  } catch (error: any) {
    console.error('❌ Error creating RFP:', error);
    return res
      .status(500)
      .json({ message: 'Failed to create RFP', error: error.message });
  }
};

// Get all RFPs
export const getAllRFPs = async (req: Request, res: Response) => {
  try {
    const rfps = await RFP.find().sort({ createdAt: -1 });
    return res.json(rfps);
  } catch (error: any) {
    console.error('❌ Error fetching RFPs:', error);
    return res
      .status(500)
      .json({ message: 'Failed to fetch RFPs', error: error.message });
  }
};

// Send RFP to selected vendors via email
export const sendRFPToVendors = async (req: Request, res: Response) => {
  try {
    const { rfpId, vendorIds } = req.body as { rfpId?: string; vendorIds?: string[] };

    if (!rfpId || !vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
      return res
        .status(400)
        .json({ message: 'RFP ID and at least one vendor ID are required' });
    }

    const rfp: any = await RFP.findById(rfpId);
    if (!rfp) {
      return res.status(404).json({ message: 'RFP not found' });
    }

    const vendors: any[] = await Vendor.find({ _id: { $in: vendorIds } });
    if (vendors.length === 0) {
      return res.status(404).json({ message: 'No valid vendors found for given IDs' });
    }

    console.log(`📤 Sending RFP "${rfp.title}" to ${vendors.length} vendors...`);

    const emailResults: {
      vendorId: string;
      email: string;
      success: boolean;
      error: string | null;
    }[] = [];

    for (const vendor of vendors) {
      const result = await (sendRFPEmail as any)(vendor, rfp);

      emailResults.push({
        vendorId: vendor._id?.toString?.() ?? String(vendor._id),
        email: vendor.email,
        success: !!(result && result.success),
        error: result && result.error ? String(result.error) : null,
      });
    }

    return res.json({
      message: 'RFP email sending completed',
      rfpId: rfp._id?.toString?.() ?? String(rfp._id),
      vendorCount: vendors.length,
      emailResults,
    });
  } catch (error: any) {
    console.error('❌ Error sending RFP:', error);
    return res
      .status(500)
      .json({ message: 'Failed to send RFP', error: error.message });
  }
};

// Compare proposals for a given RFP using Gemini
/* 
export const compareProposalsWithAI = async (req: Request, res: Response) => {
  try {
    const rfpId = req.params.id;

    console.log(`🔍 Comparing proposals for RFP: ${rfpId}`);

    const rfp: any = await RFP.findById(rfpId);
    if (!rfp) {
      return res.status(404).json({ message: 'RFP not found' });
    }

    const proposals: any[] = await Proposal.find({ rfp: rfpId }).populate('vendor');
    if (!proposals || proposals.length === 0) {
      return res
        .status(400)
        .json({ message: 'No proposals to compare for this RFP' });
    }

    console.log(`📊 Found ${proposals.length} proposals, calling Gemini...`);

    const comparison = await compareProposals(rfp, proposals);

    console.log('✅ Comparison complete');

    return res.json(comparison);
  } catch (error: any) {
    console.error('❌ Error comparing proposals:', error);
    return res.status(500).json({
      message: 'Failed to compare proposals',
      error: error.message,
    });
  }
};  */

export const compareProposalsWithAI = async (req: Request, res: Response) => {
  try {
    const rfpId = req.params.id;

    console.log(`🔍 Comparing proposals for RFP: ${rfpId}`);

    const rfp: any = await RFP.findById(rfpId);
    if (!rfp) {
      return res.status(404).json({ message: 'RFP not found' });
    }

    const proposals: any[] = await Proposal.find({ rfp: rfpId }).populate(
      'vendor'
    );
    if (!proposals || proposals.length === 0) {
      return res
        .status(400)
        .json({ message: 'No proposals to compare for this RFP' });
    }

    console.log(`📊 Found ${proposals.length} proposals, running math comparison...`);

    const comparison = await compareProposals(rfp, proposals);

    console.log('✅ Comparison complete');

    return res.json(comparison);
  } catch (error: any) {
    console.error('❌ Error comparing proposals:', error);
    return res.status(500).json({
      message: 'Failed to compare proposals',
      error: error.message,
    });
  }
};
