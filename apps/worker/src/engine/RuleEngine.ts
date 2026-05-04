/**
 * @file apps/worker/src/engine/RuleEngine.ts
 * @description Çekirdek iş mantığı motoru. Birdeye'dan gelen verileri
 *              veritabanındaki kurallarla kıyaslar. Karşılaştırma işlemini
 *              OperatorRegistry üzerinden dinamik olarak çözer (Strategy Pattern).
 *              Eşleşme durumunda BullMQ kuyruğuna asenkron job ekler.
 */

import { Queue } from 'bullmq';
import type { IBirdeyeService } from '../interfaces/IBirdeyeService';
import type { IRuleRepository } from '../interfaces/IRuleRepository';
import type { IRule, BirdeyeToken, NotificationJobPayload, TriggerType, BirdeyeSecurityData, BirdeyeMarketData } from '@chaintrigger/shared';
import { OperatorRegistry } from './operators/OperatorRegistry';
import { TriggerRegistry } from './strategies/TriggerRegistry';
import { AlertModel } from '@chaintrigger/shared';

export class RuleEngine {
  constructor(
    private readonly ruleRepository: IRuleRepository,
    private readonly birdeyeService: IBirdeyeService,
    private readonly notificationQueue: Queue<NotificationJobPayload>,
    private readonly operatorRegistry: OperatorRegistry = new OperatorRegistry(),
    private readonly triggerRegistry: TriggerRegistry = new TriggerRegistry()
  ) {}

  /**
   * Engine döngüsünün ana fonksiyonu. Tüm aktif kuralları çeker,
   * ilgili trigger tipine göre eşleştirme yapar.
   */
  async process(): Promise<void> {
    const activeRules = await this.ruleRepository.findAllActive();
    const jobPromises: Promise<any>[] = [];

    // Trigger + Chain kombinasyonuna göre gruplandırılmış tokenlar (cacheleme için)
    const cachedTokens = new Map<string, BirdeyeToken[]>();

    for (const rule of activeRules) {
      const cacheKey = `${rule.triggerType}:${rule.chain}`;
      if (!cachedTokens.has(cacheKey)) {
        const strategy = this.triggerRegistry.resolve(rule.triggerType);
        const tokens = await strategy.fetchAndFilter(this.birdeyeService, rule.chain);
        cachedTokens.set(cacheKey, tokens);
      }

      const tokens = cachedTokens.get(cacheKey) || [];
      for (const token of tokens) {
        jobPromises.push(this.processRuleForToken(rule, token));
      }
    }

    await Promise.allSettled(jobPromises);
  }

  private async processRuleForToken(rule: IRule, token: BirdeyeToken): Promise<void> {
    const { isMatch, security, marketData } = await this.evaluateConditions(rule, token);
    if (isMatch) {
      // Persist match for dashboard feed
      await AlertModel.create({
        ruleId: rule._id,
        userId: rule.userId,
        token,
        security,
        chain: rule.chain
      });

      await this.enqueueNotification(rule, token, security, marketData);
    }
  }

  /**
   * Bir token'ın kuraldaki tüm şartları sağlayıp sağlamadığını kontrol eder.
   * Endpoint Chaining: Gerektiğinde security ve market-data API'lerini çağırır.
   */
  private async evaluateConditions(
    rule: IRule, 
    token: BirdeyeToken
  ): Promise<{ isMatch: boolean; security: BirdeyeSecurityData; marketData?: BirdeyeMarketData }> {
    // 1. Temel Filtreleme (API Gerektirmeyen alanlar)
    const basicFields = ['liquidity', 'volume_24h', 'price_change_24h'];
    const basicConditions = rule.conditions.filter(c => basicFields.includes(c.field));
    
    const fieldValues: Record<string, number> = {
      liquidity: token.liquidity,
      volume_24h: token.volume24h,
      price_change_24h: token.priceChange24h,
    };

    // Temel şartlar sağlanmıyorsa direkt false dön, API harcama!
    const passesBasic = basicConditions.every((condition) => {
      const actual = fieldValues[condition.field];
      const operatorStrategy = this.operatorRegistry.resolve(condition.operator);
      return operatorStrategy.evaluate(actual, condition.value);
    });

    if (!passesBasic) {
      return { 
        isMatch: false, 
        security: { address: token.address, securityScore: 0, isHoneypot: false, isRugPull: false, noMintAuthority: false, noFreezeAuthority: false, top10HolderPercent: 0 } 
      };
    }

    // 2. Güvenlik ve Market Verisi Fetching (Sadece temel filtreyi geçenler için)
    // Bu noktada API çağrısı yapıyoruz çünkü token potansiyel bir "match" adayı.
    const security = await this.birdeyeService.getTokenSecurity(token.address, rule.chain);
    const marketData = await this.birdeyeService.getMarketData(token.address, rule.chain);

    fieldValues.security_score = security.securityScore;
    fieldValues.no_mint_authority = security.noMintAuthority ? 1 : 0;
    fieldValues.no_freeze_authority = security.noFreezeAuthority ? 1 : 0;
    fieldValues.top_10_holder_percent = security.top10HolderPercent ?? 0;

    // 3. Tüm şartları tekrar kontrol et (Security dahil)
    const isMatch = rule.conditions.every((condition) => {
      const actual = fieldValues[condition.field];
      const operatorStrategy = this.operatorRegistry.resolve(condition.operator);
      return operatorStrategy.evaluate(actual, condition.value);
    });

    return { isMatch, security, marketData };
  }

  private async enqueueNotification(
    rule: IRule, 
    token: BirdeyeToken, 
    security: BirdeyeSecurityData,
    marketData?: BirdeyeMarketData
  ): Promise<void> {
    const payload: NotificationJobPayload = {
      ruleId: rule._id!,
      userId: rule.userId,
      action: rule.action,
      token,
      security,
      marketData,
      chain: rule.chain,
      triggeredAt: new Date(),
    };

    // Aynı kural ve token için tekrar mesaj gitmesini önleyen yapı (jobId)
    await this.notificationQueue.add('send-notification', payload, {
      jobId: `${rule._id}-${token.address}`,
    });
  }
}
