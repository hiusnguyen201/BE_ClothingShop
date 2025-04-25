function* generateErrorId() {
  while (true) {
    const timestamp = Date.now();
    const errorId = 'ERROR_' + timestamp;
    yield errorId;
  }
}

export const errorIdGenerator = generateErrorId();

function* generateOrderCode() {
  let count = 1000;
  while (true) {
    const orderId = 'ORDER_' + count;
    yield orderId;
    count++;
  }
}

export const orderCodeGenerator = generateOrderCode();
