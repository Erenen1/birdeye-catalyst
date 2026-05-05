/**
 * @file packages/shared/src/models/SpherePaymentLog.model.ts
 * @description Mongoose schema for logging Sphere payment events.
 *              Her webhook payment event'i buraya kaydedilir; idempotency
 *              ve audit trail için kullanılır.
 */

import mongoose, { Schema, Document } from 'mongoose';
import type { ISpherePaymentLog } from '../types';

export interface ISpherePaymentLogDocument
  extends Omit<ISpherePaymentLog, '_id'>,
    Document {}

const SpherePaymentLogSchema = new Schema<ISpherePaymentLogDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    sphereSubscriptionId: {
      type: String,
      required: true,
      index: true,
    },
    spherePaymentId: {
      type: String,
      required: true,
      unique: true, // Idempotency: aynı payment iki kez kaydedilemez
      index: true,
    },
    status: {
      type: String,
      enum: ['succeeded', 'failed', 'pending'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: ['USDC'],
      default: 'USDC',
    },
    chain: {
      type: String,
      enum: ['solana'],
      default: 'solana',
    },
    eventType: {
      type: String,
      required: true,
    },
    rawPayload: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const SpherePaymentLogModel =
  (mongoose.models.SpherePaymentLog as mongoose.Model<ISpherePaymentLogDocument>) ||
  mongoose.model<ISpherePaymentLogDocument>(
    'SpherePaymentLog',
    SpherePaymentLogSchema
  );
