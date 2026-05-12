/**
 * @file apps/worker/src/repositories/MongoUserRepository.ts
 * @description IUserRepository'nin MongoDB/Mongoose implementasyonu.
 *              Tüm veri erişim ve mutasyon mantığı bu sınıfta kapsüllenir (SRP).
 *              Atomik `$inc` ve `findOneAndUpdate` (upsert) operasyonları kullanılarak
 *              race condition riskleri minimize edilmiştir.
 */

import { UserModel } from '@chaintrigger/shared';
import type { IUser } from '@chaintrigger/shared';
import type { IUserRepository } from '../interfaces/IUserRepository';

export class MongoUserRepository implements IUserRepository {
  async findByWalletAddress(walletAddress: string): Promise<IUser | null> {
    const user = await UserModel.findOne({
      walletAddress: walletAddress,
    })
      .lean()
      .exec();
    return user as unknown as IUser | null;
  }

  async findOrCreate(walletAddress: string): Promise<IUser> {
    // upsert: true → bulunamazsa oluşturur; new: true → güncel dokümanı döner
    const user = await UserModel.findOneAndUpdate(
      { walletAddress: walletAddress },
      { $setOnInsert: { walletAddress: walletAddress } },
      { upsert: true, new: true, lean: true }
    ).exec();
    return user as unknown as IUser;
  }

  async incrementRuleCount(userId: string, delta: 1 | -1): Promise<void> {
    // $inc ile atomik artış/azalış — dokümanı okuyup yazma race condition'ını önler
    await UserModel.findByIdAndUpdate(userId, {
      $inc: { activeRuleCount: delta },
    }).exec();
  }

  async upgradeToPro(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, { tier: 'pro' }).exec();
  }
}
