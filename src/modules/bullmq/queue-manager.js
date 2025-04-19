import { Queue, Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

export function createQueue(name) {
  return new Queue(name, { connection });
}

export function createQueueEvents(name) {
  return new QueueEvents(name, { connection });
}

export function createWorker(name, processor) {
  return new Worker(
    name,
    async (job) => {
      console.log(job);
      return processor(job.data);
    },
    { connection },
  );
}
