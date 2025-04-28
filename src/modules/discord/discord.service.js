import axios from 'axios';

export class DiscordService {
  static async sendError(payload) {
    const webhookUrl =
      'https://discord.com/api/webhooks/1365424787848958073/T7XPdD67ujswg8KiOLWOGiauq4XUM-IrjV3wSLVqCfEz7L2cjUgjo4bMDYU6kOXMFBh7';
    const message2 = '```json\n' + JSON.stringify(payload, null, 2) + '\n```';
    await axios.post(webhookUrl, { content: message2 });
  }
}
