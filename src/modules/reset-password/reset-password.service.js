import moment from "moment-timezone";
import { ResetPassword } from "#src/modules/reset-password/schemas/reset-password.schema";
import { generateToken } from "#src/utils/jwt.util";

/**
 * Create reset password
 * @param {*} userId
 * @returns
 */
export async function createResetPasswordService(userId) {
  const resetToken = generateToken({ userId });
  const resetTokenExpiresAt =
    moment().valueOf() +
    60 * 1000 * (+process.env.RESET_TOKEN_EXPIRES || 30);

  return await ResetPassword.create({
    token: resetToken,
    expiresAt: resetTokenExpiresAt,
    user: userId,
  });
}

/**
 * Get reset password by token
 * @param {*} token
 * @returns
 */
export async function getResetPasswordByTokenService(token) {
  return await ResetPassword.findOne({
    token: token,
    expiresAt: { $gte: moment().valueOf() },
  });
}
