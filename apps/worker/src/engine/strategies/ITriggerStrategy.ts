import type { BirdeyeToken } from '@chaintrigger/shared';
import type { IBirdeyeService } from '../../interfaces/IBirdeyeService';

export interface ITriggerStrategy {
  /**
   * Stratejinin Birdeye'dan veri çekip filtrelemesini sağlar.
   */
  fetchAndFilter(birdeyeService: IBirdeyeService, chain?: string): Promise<BirdeyeToken[]>;
}
