/**
 * @file apps/worker/src/interfaces/IRuleRepository.ts
 * @description Repository contract for the Rule aggregate.
 *              Worker bu interface'e bağımlıdır; somut MongoDB implementasyonuna değil.
 *              (Dependency Inversion Principle — DIP)
 *
 *              ISP gereği bu interface yalnızca Rule'a özgü operasyonları tanımlar.
 */

import type { IRule } from '@chaintrigger/shared';

export interface IRuleRepository {
  /** Tüm aktif kuralları döndürür (Worker engine döngüsü için). */
  findAllActive(): Promise<IRule[]>;

  /** ID'ye göre tek bir kural getirir. */
  findById(id: string): Promise<IRule | null>;

  /** Belirli bir kullanıcının tüm kurallarını döndürür (Dashboard için). */
  findByUserId(userId: string): Promise<IRule[]>;

  /**
   * Yeni bir kural oluşturur.
   * @returns Oluşturulan dokümanın _id'si dahil tam IRule nesnesi.
   */
  create(data: Omit<IRule, '_id' | 'createdAt' | 'updatedAt'>): Promise<IRule>;

  /** Bir kuralı kalıcı olarak siler. */
  deleteById(id: string): Promise<void>;

  /** Bir kuralı aktif/pasif durumuna getirir. */
  setActive(id: string, isActive: boolean): Promise<void>;
}

