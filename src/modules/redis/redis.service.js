import { Redis } from 'ioredis';

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  lazyConnect: true,
  enableReadyCheck: true,
  maxRetriesPerRequest: null,
  retryStrategy: (retries) => Math.min(retries * 100, 2000),
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
});

redisClient.on('connect', () => console.log('Connected to Redis'));

redisClient.on('error', async (err) => {
  console.log('Closed Redis connection');
});

export async function get(key) {
  const cached = await redisClient.get(key);
  return cached ? JSON.parse(cached) : null;
}

export async function set(key, data, ttlInSeconds = 300) {
  await redisClient.set(key, JSON.stringify(data), 'EX', ttlInSeconds);
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
