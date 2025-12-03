import mongoose, { Document, Schema } from 'mongoose';

export interface IProposal extends Document {
  rfp: mongoose.Types.ObjectId;
  vendor: mongoose.Types.ObjectId;
  totalPrice: number;
  deliveryDays: number;
  warrantyMonths: number;
  items: Array<{
    name: string;
    pricePerUnit: number;
    quantity: number;
  }>;
  notes: string;
  createdAt: Date;
}

const ProposalItemSchema = new Schema({
  name: { type: String, required: true },
  pricePerUnit: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const ProposalSchema = new Schema<IProposal>({
  rfp: { type: Schema.Types.ObjectId, ref: 'RFP', required: true },
  vendor: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  totalPrice: { type: Number, required: true },
  deliveryDays: { type: Number, required: true },
  warrantyMonths: { type: Number, required: true },
  items: [ProposalItemSchema],
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model<IProposal>('Proposal', ProposalSchema);
