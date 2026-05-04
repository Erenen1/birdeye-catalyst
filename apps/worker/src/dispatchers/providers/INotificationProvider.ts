/**
 * @file apps/worker/src/dispatchers/providers/INotificationProvider.ts
 * @description Tüm bildirim platformları için (Telegram, Discord, Slack vb.)
 *              ortak sözleşme (Interface). DI ve Strategy Pattern için kullanılır.
 */

import type { NotificationJobPayload } from '@chaintrigger/shared';

export interface INotificationProvider {
  /** Provider'ın desteklediği aksiyon tipi (örn: 'telegram', 'discord_webhook') */
  readonly type: string;

  /** Bildirimi hedefe gönderir */
  send(payload: NotificationJobPayload): Promise<void>;
}
