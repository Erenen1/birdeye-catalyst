/**
 * @file packages/shared/src/models/Rule.model.ts
 * @description Mongoose schema for the Rule domain entity.
 *              Implements the IRule interface from shared types.
 *              Serves as the single source of truth for DB structure across all services.
 */

import mongoose, { Schema, Document } from 'mongoose';
import type { IRule, TriggerType, ConditionOperator, ActionType } from '../types';

export interface IRuleDocument extends Omit<IRule, '_id'>, Document {}

const RuleConditionSchema = new Schema(
  {
    field: {
      type: String,
      enum: ['security_score', 'liquidity', 'volume_24h', 'price_change_24h', 'no_mint_authority', 'no_freeze_authority', 'top_10_holder_percent'],
      required: true,
    },
    operator: {
      type: String,
      enum: ['>=', '<=', '>', '<', '=='] satisfies ConditionOperator[],
      required: true,
    },
    value: { type: Number, required: true },
  },
  { _id: false }
);

const RuleActionSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['telegram', 'custom_webhook'] satisfies ActionType[],
      required: true,
    },
    chatId: { type: String },      // telegram
    endpoint: { type: String },    // custom_webhook
  },
  { _id: false }
);

const RuleSchema = new Schema<IRuleDocument>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    triggerType: {
      type: String,
      enum: ['new_listing', 'trending_entry', 'whale_radar', 'liquidity_drain', 'volatility_breakout', 'pump_fun_migration'] satisfies TriggerType[],
      required: true,
    },
    conditions: { type: [RuleConditionSchema], required: true },
    action: { type: RuleActionSchema, required: true },
    chain: { type: String, default: 'solana', lowercase: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,  // createdAt + updatedAt otomatik eklenir
  }
);

// Compound index: Worker sadece aktif kuralları sorgular
RuleSchema.index({ userId: 1, isActive: 1 });

export const RuleModel =
  (mongoose.models.Rule as mongoose.Model<IRuleDocument>) || 
  mongoose.model<IRuleDocument>('Rule', RuleSchema);
