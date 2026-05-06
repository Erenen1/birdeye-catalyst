/**
 * @file apps/worker/src/dispatchers/providers/TelegramProvider.ts
 * @description INotificationProvider'ın Telegram implementasyonu.
 */

import TelegramBot from 'node-telegram-bot-api';
import type { INotificationProvider } from './INotificationProvider';
import type { NotificationJobPayload, TelegramAction } from '@chaintrigger/shared';

export class TelegramProvider implements INotificationProvider {
  readonly type = 'telegram';
  private readonly bot: TelegramBot;

  constructor(botToken: string) {
    this.bot = new TelegramBot(botToken, { polling: false });
  }

  async send(payload: NotificationJobPayload): Promise<void> {
    const action = payload.action as TelegramAction;
    
    if (!action || !action.chatId) {
      console.warn(`[TelegramProvider] ⚠️ SKIP: Missing chat_id for user ${payload.userId}.`);
      return;
    }

    const message = this.buildMessage(payload);
    const buttons = this.buildButtons(payload);

    try {
      if (payload.token.logoURI) {
        await this.bot.sendPhoto(action.chatId, payload.token.logoURI, {
          caption: message,
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: buttons }
        });
      } else {
        await this.bot.sendMessage(action.chatId, message, { 
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: buttons }
        });
      }
      console.log(`[TelegramProvider] 📨 SENT: Message delivered to ${action.chatId} (Token: ${payload.token.symbol})`);
    } catch (error: any) {
      console.error(`[TelegramProvider] ❌ ERROR: Failed to send to ${action.chatId}.`, error.message);
      throw error;
    }
  }

  private buildButtons(payload: NotificationJobPayload) {
    const { token, chain } = payload;
    const buttons = [
      [
        { text: '📊 View on Birdeye', url: `https://birdeye.so/token/${token.address}?chain=${chain}` }
      ]
    ];

    if (chain === 'solana') {
      buttons.push([
        { text: '⚡ Quick Swap (Jupiter)', url: `https://jup.ag/swap/SOL-${token.address}` },
        { text: '🛡️ RugCheck Scan', url: `https://rugcheck.xyz/tokens/${token.address}` }
      ]);
    } else if (chain === 'ethereum') {
      buttons.push([
        { text: '🦄 Swap on Uniswap', url: `https://app.uniswap.org/#/swap?outputCurrency=${token.address}` }
      ]);
    }

    return buttons;
  }

  private buildMessage(payload: NotificationJobPayload): string {
    const { token, security, triggeredAt, userId } = payload;
    const isPublic = userId === 'PUBLIC';

    let msg = isPublic 
      ? `📢 *BIRDEYE GLOBAL ALPHA FEED* (Delayed 30s)\n` 
      : `🚨 *Birdeye Catalyst Alarm*\n`;

    msg += `\n*Token:* ${token.name} (${token.symbol})\n` +
      `*Adres:* \`${token.address}\`\n`;

    if (security.catalystScore !== undefined) {
      msg += `*🧠 Catalyst Skoru:* ${security.catalystScore}/100\n`;
    }
    if (security.aiPrediction) {
      const emoji = security.aiPrediction === 'BULLISH' ? '🟢' : security.aiPrediction === 'BEARISH' ? '🔴' : '🟡';
      msg += `*🤖 AI Tahmini:* ${emoji} ${security.aiPrediction}\n`;
    }
    
    msg += `*🛡️ Güvenlik Skoru:* ${security.securityScore}/100\n` +
      `*💧 Likidite:* $${token.liquidity?.toLocaleString('en-US') || 0}\n` +
      `*📊 24h Hacim:* $${token.volume24h?.toLocaleString('en-US') || 0}\n\n` +
      `🔗 [Birdeye'da İncele](https://birdeye.so/token/${token.address})\n\n`;

    if (isPublic) {
      msg += `🚀 *Want this 60s faster?* Upgrade to PRO for 10s polling and real-time alerts.\n` +
             `👉 [catalyst.syconlab.com/upgrade](https://catalyst.syconlab.com/upgrade)\n\n`;
    }

    msg += `--- \n` +
      `⚠️ *DISCLAIMER:* This is an automated data signal, NOT financial advice. Always DYOR. _Birdeye Catalyst v2.0_\n` +
      `_⏱ ${new Date(triggeredAt).toISOString()}_`;

    return msg;
  }
}
