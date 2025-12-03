import { Request, Response } from 'express';
import Vendor from '../models/Vendor';

// Create new vendor
export const createVendor = async (req: Request, res: Response) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Check if vendor with this email already exists
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(400).json({ message: 'Vendor with this email already exists' });
    }

    const vendor = await Vendor.create({ name, email, phone });

    res.status(201).json({
      message: 'Vendor created successfully',
      vendor,
    });
  } catch (error: any) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ message: 'Failed to create vendor', error: error.message });
  }
};

// Get all vendors
export const getAllVendors = async (req: Request, res: Response) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });
    res.json(vendors);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch vendors', error: error.message });
  }
};

// Get single vendor by ID
export const getVendorById = async (req: Request, res: Response) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json(vendor);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch vendor', error: error.message });
  }
};

// Update vendor
export const updateVendor = async (req: Request, res: Response) => {
  try {
    const { name, email, phone } = req.body;

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { name, email, phone },
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({
      message: 'Vendor updated successfully',
      vendor,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update vendor', error: error.message });
  }
};

// Delete vendor
export const deleteVendor = async (req: Request, res: Response) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({ message: 'Vendor deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete vendor', error: error.message });
  }
};
