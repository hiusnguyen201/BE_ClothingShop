import moment from "moment-timezone";
import { UserOtpModel } from "#src/modules/user-otps/schemas/user-otp.schema";
import { generateOtp } from "#src/utils/string.util";

const SELECTED_FIELDS = "_id otp expireDate user createdAt updatedAt";

/**
 * Create userOtp
 * @param {*} userId
 * @returns
 */
export async function createUserOtpService(userId) {
  const newUserOtp = await UserOtpModel.create({
    otp: generateOtp(),
    expireDate:
      moment().valueOf() + 60 * 1000 * (+process.env.OTP_EXPIRES || 5),
    user: userId,
  });
  return newUserOtp;
}

/**
 * Get userOtp by otp and userId
 * @param {*} otp
 * @param {*} userId
 * @returns
 */
export async function getUserOtpByOtpAndUserIdService(otp, userId) {
  const userOtp = await UserOtpModel.findOne({
    user: userId,
    otp,
    expireDate: { $gt: moment().valueOf() },
  }).select(SELECTED_FIELDS);
  return userOtp;
}
