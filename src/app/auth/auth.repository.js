import { generateNumericOTP } from '#src/utils/string.util';
import { UserOtpModel } from '#src/app/auth/models/user-otp.model';
import moment from 'moment-timezone';

moment.tz('Asia/Ho_Chi_Minh');

/**
 * Create userOtp
 * @param {string} userId
 * @returns
 */
export async function createUserOtpRepository(userId) {
  const otpCode = generateNumericOTP();
  return UserOtpModel.create({
    otp: otpCode,
    user: userId,
    expireDate: moment().valueOf() + 60 * 1000 * +process.env.OTP_TTL_IN_MINUTES,
  });
}

/**
 * Get valid userOtp by otp and userId
 * @param {string} otp
 * @param {string} userId
 * @returns
 */
export async function getValidUserOtpInUserRepository(userId, otp) {
  return UserOtpModel.findOne({
    user: userId,
    otp,
    expireDate: { $gt: moment().valueOf() },
  }).lean();
}

/**
 * Remove user otps
 * @param {string} userId
 * @returns
 */
export async function removeUserOtpsInUserRepository(userId) {
  return UserOtpModel.deleteMany({ user: userId });
}
