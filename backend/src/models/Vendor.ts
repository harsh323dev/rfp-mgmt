import mongoose, { Document, Schema } from 'mongoose';

export interface IVendor extends Document {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema = new Schema<IVendor>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: { type: String, required: true },
    company: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IVendor>('Vendor', VendorSchema);
