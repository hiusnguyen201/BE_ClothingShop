import mongoose from 'mongoose';

export class TransactionalServiceWrapper {
  static async execute(cb) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const result = await cb(session);
      await session.commitTransaction();
      return result;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }
}
