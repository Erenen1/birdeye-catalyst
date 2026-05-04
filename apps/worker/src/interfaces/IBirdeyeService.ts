/**
 * @file apps/worker/src/interfaces/IBirdeyeService.ts
 * @description Birdeye API servis contract'ı.
 *              Gerçek HTTP implementasyonu bu interface'i implemente eder;
 *              test ortamında mock ile değiştirilebilir.
 */

import type { BirdeyeToken, BirdeyeSecurityData, BirdeyeMarketData } from '@chaintrigger/shared';

export interface IBirdeyeService {
  /**
   * /v2/tokens/new_listing endpoint'inden son listelenen tokenları getirir.
   */
  getNewListings(chain?: string): Promise<BirdeyeToken[]>;

  /**
   * /defi/token_trending endpoint'inden trending tokenları getirir.
   */
  getTrendingTokens(chain?: string): Promise<BirdeyeToken[]>;

  /**
   * /defi/token_security endpoint'inden güvenlik analizi verisi getirir.
   */
  getTokenSecurity(address: string, chain?: string): Promise<BirdeyeSecurityData>;

  /**
   * /defi/v3/token/market-data endpoint'inden pazar verisi getirir.
   */
  getMarketData(address: string, chain?: string): Promise<BirdeyeMarketData>;
}
