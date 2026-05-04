/**
 * @file apps/worker/src/dispatchers/providers/CustomWebhookProvider.ts
 * @description INotificationProvider'ın Özel Webhook (Custom Webhook) implementasyonu.
 *              Kullanıcıların kendi sistemlerine (veya Zapier, Make.com gibi araçlara)
 *              JSON verisi fırlatmasını sağlar.
 */

import axios from 'axios';
import type { INotificationProvider } from './INotificationProvider';
import type { NotificationJobPayload, CustomWebhookAction } from '@chaintrigger/shared';

export class CustomWebhookProvider implements INotificationProvider {
  readonly type = 'custom_webhook';

  async send(payload: NotificationJobPayload): Promise<void> {
    const action = payload.action as CustomWebhookAction;

    // Hedef URL'ye standart JSON payload'unu doğrudan gönderiyoruz
    await axios.post(action.endpoint, payload, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ChainTrigger-Webhook-Client/1.0',
      },
      timeout: 5000, // İstek takılı kalmasın diye 5 saniye zaman aşımı
    });
  }
}
