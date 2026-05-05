/**
 * @file packages/shared/src/models/SphereSubscription.model.ts
 * @description Mongoose schema for Sphere Pay subscription tracking.
 *              Her kullanıcı için Sphere üzerindeki abonelik durumunu tutar.
 */

import mongoose, { Schema, Document } from 'mongoose';
import type { ISphereSubscription, SphereSubscriptionStatus } from '../types';

export interface ISphereSubscriptionDocument
  extends Omit<ISphereSubscription, '_id'>,
    Document {}

const SphereSubscriptionSchema = new Schema<ISphereSubscriptionDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    sphereCustomerId: {
      type: String,
      required: true,
      index: true,
    },
    sphereSubscriptionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'active',
        'past_due',
        'canceled',
        'unpaid',
        'paused',
        'trialing',
      ] satisfies SphereSubscriptionStatus[],
      default: 'active',
    },
    plan: {
      type: String,
      required: true,
      default: 'pro',
    },
    chain: {
      type: String,
      enum: ['solana'],
      default: 'solana',
    },
    currency: {
      type: String,
      enum: ['USDC'],
      default: 'USDC',
    },
    amount: {
      type: Number,
      required: true,
    },
    currentPeriodStart: {
      type: Date,
      required: true,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
      index: true,
    },
    gracePeriodEnd: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const SphereSubscriptionModel =
  (mongoose.models.SphereSubscription as mongoose.Model<ISphereSubscriptionDocument>) ||
  mongoose.model<ISphereSubscriptionDocument>(
    'SphereSubscription',
    SphereSubscriptionSchema
  );
