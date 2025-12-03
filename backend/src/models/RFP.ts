import mongoose, { Document, Schema } from 'mongoose';

export interface IRFP extends Document {
  title: string;
  description: string;
  budget: number;
  items: {
    name: string;
    quantity: number;
    specifications: string;
  }[];
  deliveryDays: number;
  paymentTerms: string;
  warrantyMonths: number;
  createdAt: Date;
  updatedAt: Date;
}

const RFPSchema = new Schema<IRFP>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    budget: { type: Number, required: true },
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        specifications: { type: String, required: true },
      },
    ],
    deliveryDays: { type: Number, required: true },
    paymentTerms: { type: String, required: true },
    warrantyMonths: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IRFP>('RFP', RFPSchema);
