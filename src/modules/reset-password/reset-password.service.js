import { ResetPassword } from "#src/modules/reset-password/schemas/reset-password.schema";
import config from "#src/config";
import moment from "moment-timezone";
import { generateToken } from "#src/utils/jwt.util";

/**
 * Create reset password
 * @param {*} userId
 * @returns
 */
export async function createResetPasswordService(userId) {
  const resetToken = generateToken({ userId });
  const resetTokenExpiresAt =
    moment().valueOf() + 60 * 1000 * config.resetTokenExpiresMinutes;

  return await ResetPassword.create({
    token: resetToken,
    expiresAt: resetTokenExpiresAt,
    user: userId,
  });
}

/**
 * Find reset password by token
 * @param {*} token
 * @returns
 */
export async function findResetPasswordByTokenService(token) {
  return await ResetPassword.findOne({
    token: token,
    expiresAt: { $gte: moment().valueOf() },
  });
}
