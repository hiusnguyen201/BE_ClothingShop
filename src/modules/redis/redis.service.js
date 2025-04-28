import { Redis } from 'ioredis';
import { DiscordService } from '#src/modules/discord/discord.service';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  keepAlive: 10000,
});

redis.on('connect', () => console.log('Connected to Redis'));

redis.on('error', (err) => {
  console.log(err);
});

export default redis;
