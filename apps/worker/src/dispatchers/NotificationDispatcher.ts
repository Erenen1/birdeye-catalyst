/**
 * @file apps/worker/src/dispatchers/NotificationDispatcher.ts
 * @description BullMQ üzerinden 'notifications' kuyruğunu dinleyen Worker servis.
 *              Kuyruğa düşen job'un action.type alanına bakarak DI konteynerinden
 *              doğru provider'ı seçer ve mesajı gönderir.
 *              Hata yönetimi ve otomatik tekrar deneme (Retry/Backoff) destekler.
 */

import { Worker, Job } from 'bullmq';
import type { NotificationJobPayload } from '@chaintrigger/shared';
import type { INotificationProvider } from './providers/INotificationProvider';

export class NotificationDispatcher {
  private readonly worker: Worker<NotificationJobPayload>;
  private readonly providers = new Map<string, INotificationProvider>();

  constructor(
    redisConnection: { host: string; port: number },
    providers: INotificationProvider[]
  ) {
    // Provider'ları Map'e kaydet (Strategy Pattern lookup)
    for (const provider of providers) {
      this.providers.set(provider.type, provider);
    }

    // BullMQ Worker Başlatılıyor (Kuyruğu dinlemeye başlar)
    this.worker = new Worker<NotificationJobPayload>(
      'notifications',
      this.processJob.bind(this),
      {
        connection: redisConnection,
        concurrency: 5, // Aynı anda en fazla 5 mesaj işlenir (Rate Limit koruması)
      }
    );

    this.setupListeners();
  }

  private async processJob(job: Job<NotificationJobPayload>): Promise<void> {
    const { action, ruleId } = job.data;
    
    console.log(`[Dispatcher] Job ${job.id} işleniyor... (Rule: ${ruleId}, Type: ${action.type})`);

    const provider = this.providers.get(action.type);
    
    if (!provider) {
      // Hata fırlattığımızda BullMQ job'ı failed duruma çeker.
      throw new Error(`Desteklenmeyen bildirim tipi: ${action.type}`);
    }

    try {
      await provider.send(job.data);
    } catch (error: any) {
      console.error(`[Dispatcher] Provider '${action.type}' iletişim hatası:`, error.message);
      // Hata fırlatarak BullMQ'nun retry logic'ini (exponential backoff) tetikliyoruz
      throw error; 
    }
  }

  private setupListeners(): void {
    this.worker.on('completed', (job) => {
      console.log(`[Dispatcher] ✅ Job ${job.id} başarıyla iletildi.`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`[Dispatcher] ❌ Job ${job?.id} BAŞARISIZ. Sebeb:`, err.message);
    });
  }

  async close(): Promise<void> {
    await this.worker.close();
  }
}
