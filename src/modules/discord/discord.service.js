import axios from 'axios';

export class DiscordService {
  /**
   * @param {any} payload
   */
  static async sendError(payload) {
    if (process.env.NODE_ENV === 'development') return;
    const webhookUrl =
      process.env.DISCORD_WEBHOOK_ERROR_URL ??
      'https://discord.com/api/webhooks/1365424787848958073/T7XPdD67ujswg8KiOLWOGiauq4XUM-IrjV3wSLVqCfEz7L2cjUgjo4bMDYU6kOXMFBh7';
    const message2 = '```json\n' + JSON.stringify(payload, null, 2) + '\n```';
    await axios.post(webhookUrl, { content: message2 });
  }

  /**
   * @param {any} payload
   */
  static async sendActivityTestAccount(payload) {
    if (process.env.NODE_ENV === 'development') return;
    const webhookUrl =
      process.env.DISCORD_WEBHOOK_ACTIVITY_ACCOUNT_TEST_URL ??
      'https://discord.com/api/webhooks/1371791653928697946/mhybvxXWDvJIgksp2WnUrfEYRJzzTiW-X-kcD_310Ra2wXejcOssY4Eu-xnVigseQ-DK';
    const message2 = '```json\n' + JSON.stringify(payload, null, 2) + '\n```';
    await axios.post(webhookUrl, { content: message2 });
  }
}
