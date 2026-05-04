/**
 * @file apps/worker/src/use-cases/ManageRuleUseCase.ts
 * @description Kural yönetimi (oluşturma ve silme) için iş mantığı katmanı.
 *              Free tier kota kontrolü (max 3 aktif kural) bu use-case içinde yönetilir.
 *              Repository'leri interface üzerinden tüketerek DIP'e uyum sağlar.
 */

import { FREE_TIER_RULE_LIMIT } from '@chaintrigger/shared';
import type { IRule } from '@chaintrigger/shared';
import type { IRuleRepository } from '../interfaces/IRuleRepository';
import type { IUserRepository } from '../interfaces/IUserRepository';


export class QuotaExceededError extends Error {
  constructor() {
    super(`Free tier kullanıcıları en fazla ${FREE_TIER_RULE_LIMIT} aktif kural oluşturabilir.`);
    this.name = 'QuotaExceededError';
  }
}

export class RuleNotFoundError extends Error {
  constructor(id: string) {
    super(`Kural bulunamadı: ${id}`);
    this.name = 'RuleNotFoundError';
  }
}

// ─── Use-Case ─────────────────────────────────────────────────────────────────

export class ManageRuleUseCase {
  constructor(
    private readonly ruleRepository: IRuleRepository,
    private readonly userRepository: IUserRepository
  ) { }

  /**
   * Kota kontrolü yaparak yeni bir kural oluşturur.
   * Free tier kullanıcılar için 3 kural sınırı uygulanır.
   */
  async createRule(
    data: Omit<IRule, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<IRule> {
    const user = await this.userRepository.findOrCreate(data.userId);

    // Pro tier kullanıcıları kota kontrolünden muaf
    if (user.tier === 'free' && user.activeRuleCount >= FREE_TIER_RULE_LIMIT) {
      throw new QuotaExceededError();
    }

    const [newRule] = await Promise.all([
      this.ruleRepository.create(data),
      this.userRepository.incrementRuleCount(user._id!, 1),
    ]);

    return newRule;
  }

  /**
   * Bir kuralı siler ve kullanıcının kota sayacını azaltır.
   */
  async deleteRule(ruleId: string, requestingUserId: string): Promise<void> {
    const rule = await this.ruleRepository.findById(ruleId);

    if (!rule) throw new RuleNotFoundError(ruleId);

    // Yalnızca kural sahibi silebilir (Authorization guard)
    if (rule.userId !== requestingUserId) {
      throw new Error('Bu kuralı silme yetkiniz yok.');
    }

    await Promise.all([
      this.ruleRepository.deleteById(ruleId),
      this.userRepository.incrementRuleCount(requestingUserId, -1),
    ]);
  }

  /**
   * Kullanıcının tüm kurallarını listeler.
   */
  async listRules(userId: string): Promise<IRule[]> {
    return this.ruleRepository.findByUserId(userId);
  }

  /**
   * Bir kuralı aktif veya pasif yapar.
   */
  async toggleRule(ruleId: string, isActive: boolean): Promise<void> {
    const rule = await this.ruleRepository.findById(ruleId);
    if (!rule) throw new RuleNotFoundError(ruleId);
    await this.ruleRepository.setActive(ruleId, isActive);
  }
}
