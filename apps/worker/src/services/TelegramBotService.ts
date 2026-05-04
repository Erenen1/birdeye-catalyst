import TelegramBot from 'node-telegram-bot-api';
import { UserModel } from '@chaintrigger/shared';

export class TelegramBotService {
  private bot: TelegramBot;

  constructor(token: string) {
    this.bot = new TelegramBot(token, { polling: true });
    this.setupListeners();
    console.log('🤖 Telegram Bot Service started with polling.');
  }

  private setupListeners() {
    this.bot.onText(/\/start (.+)/, async (msg, match) => {
      const chatId = msg.chat.id.toString();
      const verificationToken = match?.[1];
      const username = msg.from?.username || msg.from?.first_name || 'User';

      if (!verificationToken) return;

      try {
        const user = await UserModel.findOneAndUpdate(
          { telegramVerificationToken: verificationToken },
          { 
            telegramChatId: chatId,
            telegramUsername: username,
            telegramVerificationToken: null // Clear token after use
          },
          { new: true }
        );

        if (user) {
          await this.bot.sendMessage(chatId, `✅ *Connection Successful!*\n\nYour wallet \`${user.walletAddress}\` is now linked to this Telegram account. You will receive on-chain alerts here.`, { parse_mode: 'Markdown' });
        } else {
          await this.bot.sendMessage(chatId, '❌ *Invalid or expired token.*\nPlease try linking again from the dashboard.');
        }
      } catch (error) {
        console.error('Error in telegram verification:', error);
        await this.bot.sendMessage(chatId, '⚠️ An error occurred during verification.');
      }
    });

    this.bot.onText(/\/start$/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(chatId, '👋 *Welcome to Birdeye Catalyst!*\n\nTo link your account, please use the "Connect Telegram" button on the dashboard.', { parse_mode: 'Markdown' });
    });
  }

  public async stop() {
    await this.bot.stopPolling();
  }
}
