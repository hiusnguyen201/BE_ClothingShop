import moment from 'moment-timezone';
import { UserOtpModel } from '#models/user-otp.model';
import { generateNumericOTP } from '#utils/string.util';

/**
 * Create userOtp
 * @param {*} userId
 * @returns
 */
export async function createUserOtpService(userId) {
  return await UserOtpModel.create({
    otp: generateNumericOTP(),
    expireDate: moment().valueOf() + 60 * 1000 * (+process.env.OTP_EXPIRES || 5),
    resendDate: moment().valueOf() + 60 * 1000 * (+process.env.RESEND_OTP_TIME || 2),
    user: userId,
  });
}

/**
 * Get userOtp by otp and userId
 * @param {*} otp
 * @param {*} userId
 * @returns
 */
export async function getUserOtpByOtpAndUserIdService(otp, userId) {
  return UserOtpModel.findOne({
    user: userId,
    otp,
    expireDate: { $gt: moment().valueOf() },
  }).lean();
}

export async function getCurrentUserOtpService(userId) {
  return UserOtpModel.findOne({ user: userId }).lean();
}

export async function removeUserOtpById(id) {
  return UserOtpModel.findByIdAndDelete(id).lean();
}
