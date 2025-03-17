import moment from 'moment-timezone';
import { UserOtpModel } from '#src/models/user-otp.model';
import { generateNumericOTP } from '#src/utils/string.util';

/**
 * Create userOtp
 * @param {*} userId
 * @returns
 */
export async function createUserOtpService(userId) {
  const otpCode = generateNumericOTP();
  return UserOtpModel.create({
    otp: otpCode,
    user: userId,
    expireDate: moment().valueOf() + 60 * 1000 * +process.env.OTP_TTL_IN_MINUTES,
    resendDate: moment().valueOf() + 60 * 1000 * +process.env.RESEND_OTP_AFTER_MINUTES,
  });
}

/**
 * Get valid userOtp by otp and userId
 * @param {*} otp
 * @param {*} userId
 * @returns
 */
export async function getValidUserOtpInUserService(userId, otp) {
  return UserOtpModel.findOne({
    user: userId,
    otp,
    expireDate: { $gt: moment().valueOf() },
  }).lean();
}

/**
 * Check time left to resend OTP
 * @param {*} otp
 * @param {*} userId
 * @returns
 */
export async function checkTimeLeftToResendOTPService(userId) {
  const userOtp = await UserOtpModel.findOne({
    user: userId,
    resendDate: { $gt: moment().valueOf() },
  }).lean();
  return !userOtp ? 0 : moment(userOtp.resendDate).diff(moment(), 'seconds');
}

export async function removeUserOtpsInUserService(userId) {
  return UserOtpModel.deleteMany({ user: userId });
}
