import type { BirdeyeToken } from '@chaintrigger/shared';
import type { IBirdeyeService } from '../../interfaces/IBirdeyeService';
import type { ITriggerStrategy } from './ITriggerStrategy';

export class NewListingStrategy implements ITriggerStrategy {
  async fetchAndFilter(birdeyeService: IBirdeyeService, chain?: string): Promise<BirdeyeToken[]> {
    return birdeyeService.getNewListings(chain);
  }
}

export class TrendingStrategy implements ITriggerStrategy {
  async fetchAndFilter(birdeyeService: IBirdeyeService, chain?: string): Promise<BirdeyeToken[]> {
    return birdeyeService.getTrendingTokens(chain);
  }
}

export class WhaleRadarStrategy implements ITriggerStrategy {
  async fetchAndFilter(birdeyeService: IBirdeyeService, chain?: string): Promise<BirdeyeToken[]> {
    // Whale Radar için trending token'ları baz alıp yüksek hacimli olanları önceliklendiriyoruz (örnek mantık)
    const tokens = await birdeyeService.getTrendingTokens(chain);
    return tokens.filter(t => t.volume24h > 1000000); // 1M+ USD hacim
  }
}

export class LiquidityDrainStrategy implements ITriggerStrategy {
  async fetchAndFilter(birdeyeService: IBirdeyeService, chain?: string): Promise<BirdeyeToken[]> {
    // Ani likidite düşüşü takibi (şu an için trending üzerinden örnek filtre)
    const tokens = await birdeyeService.getTrendingTokens(chain);
    return tokens.filter(t => t.priceChange24h < -10); // %10+ düşüş
  }
}

export class VolatilityBreakoutStrategy implements ITriggerStrategy {
  async fetchAndFilter(birdeyeService: IBirdeyeService, chain?: string): Promise<BirdeyeToken[]> {
    // Hacim patlaması (hacim/likidite oranı yüksek olanlar)
    const tokens = await birdeyeService.getTrendingTokens(chain);
    return tokens.filter(t => t.volume24h / t.liquidity > 0.5);
  }
}

export class PumpFunMigrationStrategy implements ITriggerStrategy {
  async fetchAndFilter(birdeyeService: IBirdeyeService, chain: string = 'solana'): Promise<BirdeyeToken[]> {
    // Sadece Solana'da çalışır
    if (chain !== 'solana') return [];
    
    // Yeni listelenenleri al
    const tokens = await birdeyeService.getNewListings(chain);
    
    // Pump.fun migration kriteri: Yeni listelenmiş ve likiditesi belirli bir eşikte olanlar
    // Genellikle migration sonrası likidite ~60k-100k USD bandında başlar.
    return tokens.filter(t => t.liquidity > 40000 && t.liquidity < 150000);
  }
}
