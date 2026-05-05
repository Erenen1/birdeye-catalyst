import mongoose, { Schema, Document } from 'mongoose';
import type { ITrackedToken } from '../types';

export interface ITrackedTokenDocument extends Omit<ITrackedToken, '_id'>, Document {}

const TrackedTokenSchema = new Schema<ITrackedTokenDocument>(
  {
    userId: { type: String, required: true, index: true },
    tokenAddress: { type: String, required: true },
    symbol: { type: String, required: true },
    name: { type: String, required: true },
    logoURI: { type: String },
    entryPrice: { type: Number, required: true },
    entryLiquidity: { type: Number, required: true },
    chain: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

TrackedTokenSchema.index({ userId: 1, tokenAddress: 1 }, { unique: true });

export const TrackedTokenModel =
  (mongoose.models.TrackedToken as mongoose.Model<ITrackedTokenDocument>) || 
  mongoose.model<ITrackedTokenDocument>('TrackedToken', TrackedTokenSchema);
