import config from "#src/config";
import { UserOtpModel } from "#src/modules/user-otps/schemas/user-otp.schema";
import { generateOtp } from "#src/utils/string.util";
import moment from "moment-timezone";
export async function createUserOtpByUserId(userId) {
  const newUserOtp = await UserOtpModel.create({
    otp: generateOtp(),
    expireDate: moment().valueOf() + 60 * 1000 * config.otpExpiresMinutes,
    user: userId,
  });
  return newUserOtp;
}

export async function findUserOtpByOtpAndUserId(otp, userId) {
  const userOtp = await UserOtpModel.findOne({
    user: userId,
    otp,
    expireDate: { $gt: moment().valueOf() },
  });
  return userOtp;
}
