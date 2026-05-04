/**
 * @file apps/worker/src/index.ts
 * @description Worker uygulamasının giriş noktası (Bootstrapper).
 *              Bağımlılıkların (Dependencies) oluşturulup (DI Container mantığı)
 *              sistemin ayağa kaldırıldığı yerdir.
 */

import mongoose from 'mongoose';
import { createClient } from 'redis';
import { Queue } from 'bullmq';
import { MongoRuleRepository } from './repositories/MongoRuleRepository';
import { BirdeyeService } from './services/BirdeyeService';
import { RuleEngine } from './engine/RuleEngine';
import { TelegramProvider } from './dispatchers/providers/TelegramProvider';
import { CustomWebhookProvider } from './dispatchers/providers/CustomWebhookProvider';
import { NotificationDispatcher } from './dispatchers/NotificationDispatcher';
import { TelegramBotService } from './services/TelegramBotService';
import type { NotificationJobPayload } from '@chaintrigger/shared';

const POLLING_INTERVAL_MS = 10000; // 10 saniyede bir kontrol (Pro için 10s, Free için 60s)
const QUEUE_NAME = 'notifications';

async function bootstrap() {
  let tick = 0;
  console.log('🚀 Birdeye Catalyst Worker başlatılıyor...');

  const mongoUri = process.env.MONGO_URI || 'mongodb://mongodb:27017/chaintrigger';
  const redisHost = process.env.REDIS_HOST || 'redis';
  const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
  const birdeyeApiKey = process.env.BIRDEYE_API_KEY || 'test_api_key';
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || 'test_bot_token';

  // 1. Veritabanı Bağlantıları
  await mongoose.connect(mongoUri);
  console.log('✅ MongoDB bağlantısı başarılı.');

  const redisClient = createClient({ url: `redis://${redisHost}:${redisPort}` });
  await redisClient.connect();
  console.log('✅ Redis cache bağlantısı başarılı.');

  // 2. Bağımlılık Enjeksiyonu (Dependency Injection)
  const ruleRepo = new MongoRuleRepository();
  const birdeyeService = new BirdeyeService(birdeyeApiKey, redisClient);

  // Queue Oluşturma (Engine job ekler, Dispatcher dinler)
  const notificationQueue = new Queue<NotificationJobPayload>(QUEUE_NAME, {
    connection: { host: redisHost, port: redisPort },
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: true,
      removeOnFail: 1000,
    },
  });

  // 3. Engine ve Dispatcher Başlatma
  const ruleEngine = new RuleEngine(ruleRepo, birdeyeService, notificationQueue);

  const dispatcher = new NotificationDispatcher(
    { host: redisHost, port: redisPort },
    [
      new TelegramProvider(telegramBotToken),
      new CustomWebhookProvider()
    ]
  );

  // 4. Telegram Bot Service (For deep-linking /start)
  const telegramBotService = new TelegramBotService(telegramBotToken);


  console.log('⚙️ Worker Engine aktif. Döngü başlatılıyor...');

  // 4. Ana Engine Döngüsü (Polling)
  setInterval(async () => {
    try {
      console.log(`[Engine] Tick: ${tick} | Kurallar değerlendiriliyor...`);
      await ruleEngine.process(tick);
      tick = (tick + 1) % 60; // 0-59 arası döner
    } catch (error) {
      console.error('[Engine] Kritik Hata:', error);
    }
  }, POLLING_INTERVAL_MS);

  // Graceful Shutdown
  process.on('SIGINT', async () => {
    console.log('🔴 Kapatılıyor...');
    await telegramBotService.stop();
    await dispatcher.close();
    await redisClient.disconnect();
    await mongoose.disconnect();
    process.exit(0);
  });
}

bootstrap().catch((err) => {
  console.error('Başlatma hatası:', err);
  process.exit(1);
});


