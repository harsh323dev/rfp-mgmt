import { Request, Response } from 'express';
import RFP from '../models/RFP';
import { extractRFPFromText } from '../services/aiService';
import { sendRFPEmail } from '../services/emailService';
import Vendor from '../models/Vendor';

// Create RFP from natural language
export const createRFPFromText = async (req: Request, res: Response) => {
  try {
    console.log('📨 Request received at /api/rfps/create');
    console.log('📝 Request body:', req.body);
    
    const { text } = req.body;

    if (!text) {
      console.log('❌ No text provided');
      return res.status(400).json({ message: 'Text input is required' });
    }

    console.log('🤖 Calling AI service...');
    // Use AI to extract structured RFP data
    const rfpData = await extractRFPFromText(text);
    
    console.log('✅ AI extraction successful:', rfpData);

    // Create RFP in database
    const rfp = await RFP.create(rfpData);
    
    console.log('✅ RFP saved to database');

    res.status(201).json({
      message: 'RFP created successfully',
      rfp,
    });
  } catch (error: any) {
    console.error('❌ Error creating RFP:', error);
    res.status(500).json({ message: 'Failed to create RFP', error: error.message });
  }
};

// Get all RFPs
export const getAllRFPs = async (req: Request, res: Response) => {
  try {
    const rfps = await RFP.find().sort({ createdAt: -1 });
    res.json(rfps);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch RFPs', error: error.message });
  }
};

// Get single RFP by ID
export const getRFPById = async (req: Request, res: Response) => {
  try {
    const rfp = await RFP.findById(req.params.id);
    
    if (!rfp) {
      return res.status(404).json({ message: 'RFP not found' });
    }

    res.json(rfp);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch RFP', error: error.message });
  }
};

// Send RFP to selected vendors
export const sendRFPToVendors = async (req: Request, res: Response) => {
  try {
    const { rfpId, vendorIds } = req.body;

    if (!rfpId || !vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
      return res.status(400).json({ message: 'RFP ID and vendor IDs array are required' });
    }

    // Fetch RFP
    const rfp = await RFP.findById(rfpId);
    if (!rfp) {
      return res.status(404).json({ message: 'RFP not found' });
    }

    // Fetch vendors
    const vendors = await Vendor.find({ _id: { $in: vendorIds } });
    if (vendors.length === 0) {
      return res.status(404).json({ message: 'No vendors found' });
    }

    // Send emails to all vendors
    const emailResults = [];
    for (const vendor of vendors) {
      try {
        const result = await sendRFPEmail(vendor.email, vendor.name, rfp);
        emailResults.push({
          vendor: vendor.name,
          email: vendor.email,
          status: 'sent',
          messageId: result.messageId,
        });
      } catch (error: any) {
        emailResults.push({
          vendor: vendor.name,
          email: vendor.email,
          status: 'failed',
          error: error.message,
        });
      }
    }

    res.json({
      message: 'RFP sending process completed',
      results: emailResults,
    });
  } catch (error: any) {
    console.error('Error sending RFP:', error);
    res.status(500).json({ message: 'Failed to send RFP', error: error.message });
  }
};
