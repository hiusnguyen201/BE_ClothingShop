import { v4 as uuidv4 } from 'uuid';
import { createWorker, createQueue, createQueueEvents } from '#src/modules/bullmq/queue-manager';
import { createOrderControllerLogic } from '#src/app/orders/orders.controller';

export const ORDER_QUEUE_NAME = 'ORDER_QUEUE';

const orderQueue = createQueue(ORDER_QUEUE_NAME);
export const orderQueueEvent = createQueueEvents(ORDER_QUEUE_NAME);

export async function createOrderJob(data) {
  return await orderQueue.add(ORDER_QUEUE_NAME, data, {
    jobId: `order-${uuidv4()}`,
    attempts: 3,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: true,
    removeOnFail: false,
  });
}

createWorker(ORDER_QUEUE_NAME, createOrderControllerLogic);
