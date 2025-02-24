import moment from 'moment-timezone';
import { UserOtpModel } from '#models/user-otp.model';
import { generateOtp } from '#utils/string.util';

/**
 * Create userOtp
 * @param {*} userId
 * @returns
 */
export async function createUserOtpService(userId) {
  const newUserOtp = await UserOtpModel.create({
    otp: generateOtp(),
    expireDate: moment().valueOf() + 60 * 1000 * (+process.env.OTP_EXPIRES || 5),
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
  });
  return userOtp;
}
