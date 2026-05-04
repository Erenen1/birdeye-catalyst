import mongoose, { Schema, Document } from 'mongoose';
import type { IAlert } from '../types';

export interface IAlertDocument extends Omit<IAlert, '_id'>, Document {}

const AlertSchema = new Schema<IAlertDocument>(
  {
    ruleId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    triggerType: { type: String, required: true, index: true },
    token: {
      address: { type: String, required: true },
      symbol: { type: String, required: true },
      name: { type: String, required: true },
      liquidity: { type: Number },
      volume24h: { type: Number },
      priceChange24h: { type: Number },
    },
    security: {
      address: { type: String },
      securityScore: { type: Number },
      top10HolderPercent: { type: Number },
    },
    chain: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AlertSchema.index({ userId: 1, createdAt: -1 });

export const AlertModel =
  (mongoose.models.Alert as mongoose.Model<IAlertDocument>) || 
  mongoose.model<IAlertDocument>('Alert', AlertSchema);
