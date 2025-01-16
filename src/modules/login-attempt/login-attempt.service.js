import { LoginAttemptModule } from "#src/modules/login-attempt/schema/login-attempt.schema";

export async function clearLoginAttemptByUserId(userId) {
  return await LoginAttemptModule.deleteMany({ user: userId });
}

export async function createLoginAttemptByUserId(userId) {
  return await LoginAttemptModule.create({ user: userId });
}
export async function countAttemptByUserId(userId, timeAgo) {
  const attemptCount = await LoginAttemptModule.countDocuments({
    user: userId,
    createdAt: { $gt: timeAgo },
  });
  return attemptCount;
}
