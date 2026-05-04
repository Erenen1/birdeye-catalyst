/**
 * @file apps/worker/src/interfaces/IUserRepository.ts
 * @description User aggregate için repository contract'ı.
 *              Interface Segregation Principle (ISP) gereği bu interface yalnızca
 *              User'a özgü operasyonları içerir — Rule operasyonlarıyla karıştırılmaz.
 */

import type { IUser } from '@chaintrigger/shared';

export interface IUserRepository {
  /**
   * Cüzdan adresine göre kullanıcıyı getirir.
   * Wallet Connect akışında login/register için kullanılır.
   */
  findByWalletAddress(walletAddress: string): Promise<IUser | null>;

  /**
   * Cüzdan adresiyle kullanıcı bulunamazsa yeni kayıt oluşturur,
   * bulunursa mevcut kaydı döndürür. (Upsert / Find-or-Create)
   */
  findOrCreate(walletAddress: string): Promise<IUser>;

  /**
   * Kullanıcının aktif kural sayacını atomik olarak günceller.
   * @param delta +1 (kural eklendi) veya -1 (kural silindi/pasif edildi)
   */
  incrementRuleCount(userId: string, delta: 1 | -1): Promise<void>;

  /**
   * Kullanıcıyı 'pro' tier'a yükseltir.
   */
  upgradeToPro(userId: string): Promise<void>;
}
