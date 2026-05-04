import type { TriggerType } from '@chaintrigger/shared';
import { ITriggerStrategy } from './ITriggerStrategy';
import { 
  NewListingStrategy, 
  TrendingStrategy, 
  WhaleRadarStrategy, 
  LiquidityDrainStrategy, 
  VolatilityBreakoutStrategy,
  PumpFunMigrationStrategy
} from './TriggerStrategies';

export class TriggerRegistry {
  private strategies: Map<TriggerType, ITriggerStrategy> = new Map();

  constructor() {
    this.strategies.set('new_listing', new NewListingStrategy());
    this.strategies.set('trending_entry', new TrendingStrategy());
    this.strategies.set('whale_radar', new WhaleRadarStrategy());
    this.strategies.set('liquidity_drain', new LiquidityDrainStrategy());
    this.strategies.set('volatility_breakout', new VolatilityBreakoutStrategy());
    this.strategies.set('pump_fun_migration', new PumpFunMigrationStrategy());
  }

  resolve(type: TriggerType): ITriggerStrategy {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new Error(`Trigger strategy not found: ${type}`);
    }
    return strategy;
  }
}
