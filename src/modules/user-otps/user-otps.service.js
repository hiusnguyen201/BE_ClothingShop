import moment from "moment-timezone";
import { UserOtpModel } from "#src/modules/user-otps/schemas/user-otp.schema";
import { generateOtp } from "#src/utils/string.util";
import config from "#src/config";

/**
 * Create userOtp
 * @param {*} userId
 * @returns
 */
export async function createUserOtpService(userId) {
  const newUserOtp = await UserOtpModel.create({
    otp: generateOtp(),
    expireDate: moment().valueOf() + 60 * 1000 * config.otpExpiresMinutes,
    user: userId,
  });
  return newUserOtp;
}

/**
 * Find userOtp by otp and userId
 * @param {*} otp
 * @param {*} userId
 * @returns
 */
export async function findUserOtpByOtpAndUserIdService(otp, userId) {
  const userOtp = await UserOtpModel.findOne({
    user: userId,
    otp,
    expireDate: { $gt: moment().valueOf() },
  });
  return userOtp;
}
