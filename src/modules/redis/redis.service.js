import { Redis } from 'ioredis';

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  keepAlive: 10000,
});

redisClient.on('connect', () => console.log('Connected to Redis'));

redisClient.on('error', (err) => {
  console.log(err);
});

export async function get(key) {
  const cached = await redisClient.get(key);
  return JSON.parse(cached);
}

export async function set(key, data) {
  await redisClient.set(key, JSON.stringify(data));
}

export async function del(keys = []) {
  await redisClient.del(keys);
}

export { redisClient };
export default { get, set, del };
