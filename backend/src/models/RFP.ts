import mongoose, { Document, Schema } from 'mongoose';

export interface IRFP extends Document {
  title: string;
  description: string;
  budget: number;
  items: Array<{
    name: string;
    quantity: number;
    specifications: string;
  }>;
  deliveryDays: number;
  paymentTerms: string;
  warrantyMonths: number;
  createdAt: Date;
  updatedAt: Date;
}

const RFPItemSchema = new Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  specifications: { type: String, required: true },
});

const RFPSchema = new Schema<IRFP>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  items: [RFPItemSchema],
  deliveryDays: { type: Number, required: true, default: 30 },
  paymentTerms: { type: String, required: true, default: 'Net 30' },
  warrantyMonths: { type: Number, required: true, default: 12 },
}, { timestamps: true });

export default mongoose.model<IRFP>('RFP', RFPSchema);
