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
import { AlertModel, UserModel } from '@chaintrigger/shared';

export class RuleEngine {
  constructor(
    private readonly ruleRepository: IRuleRepository,
    private readonly birdeyeService: IBirdeyeService,
    private readonly notificationQueue: Queue<NotificationJobPayload>,
    private readonly operatorRegistry: OperatorRegistry = new OperatorRegistry(),
    private readonly triggerRegistry: TriggerRegistry = new TriggerRegistry()
  ) {}

  private static readonly SYSTEM_RULES: Partial<IRule>[] = [
    {
      _id: 'sys-new-listing',
      userId: 'GLOBAL',
      name: 'Global New Listing Observer',
      triggerType: 'new_listing',
      chain: 'solana',
      conditions: [{ field: 'liquidity', operator: '>', value: 1000 }]
    },
    {
      _id: 'sys-pump-fun',
      userId: 'GLOBAL',
      name: 'Global Pump.fun Observer',
      triggerType: 'pump_fun_migration',
      chain: 'solana',
      conditions: []
    },
    {
      _id: 'sys-whale-radar',
      userId: 'GLOBAL',
      name: 'Global Whale Activity Observer',
      triggerType: 'whale_radar',
      chain: 'solana',
      conditions: [{ field: 'volume_24h', operator: '>', value: 100000 }]
    }
  ];

  /**
   * Engine döngüsünün ana fonksiyonu. Tüm aktif kuralları çeker,
   * ilgili trigger tipine göre eşleştirme yapar.
   */
  async process(tick: number): Promise<void> {
    const dbRules = await this.ruleRepository.findAllActive();
    
    // Fetch user tiers for filtering speed
    const userIds = [...new Set(dbRules.map(r => r.userId))];
    const users = await UserModel.find({ walletAddress: { $in: userIds } }).select('walletAddress tier').lean().exec();
    const userTierMap = new Map(users.map(u => [u.walletAddress, u.tier]));

    // Filter rules based on tier and tick
    const activeRules = [
      ...dbRules.filter(r => {
        const tier = (userTierMap.get(r.userId) || 'free') as string;
        if (tier === 'pro') return true; // Pro rules every 10s
        return tick % 6 === 0; // Free rules every 60s (approx)
      }),
      ...RuleEngine.SYSTEM_RULES as IRule[] // System rules always
    ];
    
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
        const tier = (userTierMap.get(rule.userId) || 'pro') as string; // System rules are pro-level
        jobPromises.push(this.processRuleForToken(rule, token, tier));
      }
    }

    await Promise.allSettled(jobPromises);
  }

  private async processRuleForToken(rule: IRule, token: BirdeyeToken, tier: string = 'free'): Promise<void> {
    const { isMatch, security, marketData } = await this.evaluateConditions(rule, token, tier);
    if (isMatch) {
      // Persist match for dashboard feed
      await AlertModel.create({
        ruleId: rule._id,
        userId: rule.userId,
        triggerType: rule.triggerType,
        token,
        security,
        chain: rule.chain
      });

      // Sistem kuralları bildirim göndermez (Sadece veri biriktirir)
      if (rule.userId !== 'GLOBAL' && rule.action) {
        await this.enqueueNotification(rule, token, security, marketData);
      }

      // 10% Chance to send to Public Alpha Channel (Marketing)
      if (rule.userId === 'GLOBAL' && Math.random() < 0.1) {
        await this.enqueueGlobalAlpha(token, security, marketData, rule.chain);
      }
    }
  }

  /**
   * Public Telegram kanalına sinyal gönderir (Pazarlama amaçlı)
   */
  private async enqueueGlobalAlpha(
    token: BirdeyeToken, 
    security: BirdeyeSecurityData,
    marketData?: BirdeyeMarketData,
    chain: string = 'solana'
  ): Promise<void> {
    const payload: NotificationJobPayload = {
      ruleId: 'GLOBAL_ALPHA_FEED',
      userId: 'PUBLIC',
      action: { type: 'telegram', params: { chatId: process.env.PUBLIC_CHANNEL_ID || '@BirdeyeCatalystAlpha' } } as any,
      token,
      security,
      marketData,
      chain,
      triggeredAt: new Date(),
    };

    // Public channel alerts are slightly delayed to keep Pro value
    await this.notificationQueue.add('send-notification', payload, {
      delay: 30000, // 30s delay for public feed
      jobId: `public-${token.address}-${Date.now()}`,
    });
  }

  /**
   * Bir token'ın kuraldaki tüm şartları sağlayıp sağlamadığını kontrol eder.
   * Endpoint Chaining: Gerektiğinde security ve market-data API'lerini çağırır.
   */
  private async evaluateConditions(
    rule: IRule, 
    token: BirdeyeToken,
    tier: string = 'free'
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

    // 2. Pro Filtreleme Bariyeri
    // Sadece PRO kullanıcılar veya Global sistem kuralları gelişmiş filtreleri kullanabilir
    const advancedFields = ['security_score', 'no_mint_authority', 'no_freeze_authority', 'top_10_holder_percent'];
    const hasAdvancedConditions = rule.conditions.some(c => advancedFields.includes(c.field));

    if (tier !== 'pro' && rule.userId !== 'GLOBAL' && hasAdvancedConditions) {
       // Free users cannot match advanced conditions
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
