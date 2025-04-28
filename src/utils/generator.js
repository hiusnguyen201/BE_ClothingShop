function* generateErrorId() {
  while (true) {
    const timestamp = Date.now();
    const errorId = 'ERROR_' + timestamp;
    yield errorId;
  }
}

export const errorIdGenerator = generateErrorId();
