export async function retryBulkWrite(operation, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (err) {
      if (err.code !== 122 || i === retries - 1) throw err;
      console.warn(`Retrying bulk write operation (attempt ${i + 1})...`);
      await new Promise((res) => setTimeout(res, 1000));
    }
  }
}
