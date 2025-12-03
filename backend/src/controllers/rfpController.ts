import { Request, Response } from 'express';
import RFP from '../models/RFP';
import { extractRFPFromText } from '../services/aiService';

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
