import axios from 'axios';

export class DiscordService {
  /**
   * @param {any} payload
   */
  static async sendError(payload) {
    // if (process.env.NODE_ENV === 'development') return;
    const webhookUrl = process.env.DISCORD_WEBHOOK_ERROR_URL;
    const message2 = '```json\n' + JSON.stringify(payload, null, 2) + '\n```';
    await axios.post(webhookUrl, { content: message2 });
  }

  /**
   * @param {any} payload
   */
  static async sendActivityTestAccount(payload) {
    if (process.env.NODE_ENV === 'development') return;
    const webhookUrl = process.env.DISCORD_WEBHOOK_ACTIVITY_ACCOUNT_TEST_URL;
    const message2 = '```json\n' + JSON.stringify(payload, null, 2) + '\n```';
    await axios.post(webhookUrl, { content: message2 });
  }
}
