/**
 * @file apps/worker/src/repositories/MongoRuleRepository.ts
 * @description IRuleRepository'nin MongoDB/Mongoose implementasyonu.
 *              Veri erişim mantığını (query, projection, index hints) tek bir yerde toplar.
 *              (Single Responsibility Principle — SRP)
 */

import { RuleModel } from '@chaintrigger/shared';
import type { IRule } from '@chaintrigger/shared';
import type { IRuleRepository } from '../interfaces/IRuleRepository';

export class MongoRuleRepository implements IRuleRepository {
  async findAllActive(): Promise<IRule[]> {
    const rules = await RuleModel.find({ isActive: true }).lean().exec();
    return rules as unknown as IRule[];
  }

  async findById(id: string): Promise<IRule | null> {
    const rule = await RuleModel.findById(id).lean().exec();
    return rule as unknown as IRule | null;
  }

  async findByUserId(userId: string): Promise<IRule[]> {
    const rules = await RuleModel.find({ userId })
      .sort({ createdAt: -1 }) // En yeni kural üstte
      .lean()
      .exec();
    return rules as unknown as IRule[];
  }

  async create(data: Omit<IRule, '_id' | 'createdAt' | 'updatedAt'>): Promise<IRule> {
    const created = await RuleModel.create(data);
    return created.toObject() as unknown as IRule;
  }

  async deleteById(id: string): Promise<void> {
    await RuleModel.findByIdAndDelete(id).exec();
  }

  async setActive(id: string, isActive: boolean): Promise<void> {
    await RuleModel.findByIdAndUpdate(id, { isActive }).exec();
  }
}

