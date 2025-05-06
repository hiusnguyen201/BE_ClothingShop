import { Queue, Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';

export const queueConnection = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

export function createQueue(name) {
  return new Queue(name, { connection: queueConnection });
}

export function createQueueEvents(name) {
  return new QueueEvents(name, { connection: queueConnection });
}

export function createWorker(name, processor) {
  return new Worker(
    name,
    async (job) => {
      return processor(job.data);
    },
    { connection: queueConnection },
  );
}
