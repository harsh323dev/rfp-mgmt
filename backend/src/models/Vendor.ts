import mongoose, { Document, Schema } from 'mongoose';

export interface IVendor extends Document {
  name: string;
  email: string;
  phone?: string;
  createdAt: Date;
}

const VendorSchema = new Schema<IVendor>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
}, { timestamps: true });

export default mongoose.model<IVendor>('Vendor', VendorSchema);
