import { Redis } from 'ioredis';
import { DiscordService } from '#src/modules/discord/discord.service';

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  keepAlive: 10000,
});

redisClient.on('connect', () => console.log('Connected to Redis'));

redisClient.on('error', (err) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(err);
  }
  DiscordService.sendError(err);
});

export async function get(key) {
  const cached = await redisClient.get(key);
  return cached ? JSON.parse(cached) : null;
}

export async function set(key, data) {
  await redisClient.set(key, JSON.stringify(data));
}

export async function del(keysOrPatterns = []) {
  const tasks = keysOrPatterns.map((item) => {
    if (item.includes('*')) {
      return new Promise((resolve, reject) => {
        const stream = redisClient.scanStream({ match: item });
        const keysToDelete = [];

        stream.on('data', (keys) => {
          if (keys.length) {
            keysToDelete.push(...keys);
          }
        });

        stream.on('end', async () => {
          if (keysToDelete.length) {
            await redisClient.del(...keysToDelete);
          }
          resolve(null);
        });

        stream.on('error', (err) => reject(err));
      });
    } else {
      return redisClient.del(item);
    }
  });

  await Promise.all(tasks);
}

export { redisClient };
export default { get, set, del };
