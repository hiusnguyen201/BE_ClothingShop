import { AsyncLocalStorage } from 'async_hooks';

const requestContext = new AsyncLocalStorage();

export { requestContext };
