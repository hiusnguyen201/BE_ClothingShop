import moment from 'moment-timezone';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserOtpModel } from '#src/app/auth/models/user-otp.model';
import { UserModel } from '#src/app/users/models/user.model';
import { generateNumericOTP } from '#src/utils/string.util';
import { USER_SELECTED_FIELDS } from '#src/app/users/users.constant';

/**
 * Revoke token
 * @param {string} email
 * @param {string} password
 * @returns
 */
export async function revokeTokenByUserIdService(userId) {
  await UserModel.updateOne({ _id: userId }, { refreshToken: null });
}

/**
 * Get user by refresh token
 * @param {string} email
 * @param {string} password
 * @returns
 */
export async function getUserByRefreshTokenService(token) {
  return UserModel.findOne({
    refreshToken: token,
  })
    .select(USER_SELECTED_FIELDS)
    .lean();
}

/**
 * Authenticate User
 * @param {string} email
 * @param {string} password
 * @returns
 */
export async function authenticateUserService(email, password) {
  const user = await UserModel.findOne({ email })
    .select({ ...USER_SELECTED_FIELDS, password: true })
    .lean();
  if (!user || !compareSync(password, user.password)) {
    return null;
  }
  delete user.password;
  return user;
}

/**
 * Generate access token and refresh token
 * @param {string} userId
 * @param {any} payload
 * @returns
 */
export async function generateTokensService(userId, payload) {
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_TTL_IN_MINUTES + 'm',
  });

  const refreshToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_TTL_IN_DAYS + 'd',
  });

  await UserModel.updateOne({ _id: userId }, { refreshToken });

  return { accessToken, refreshToken };
}

/**
 * Verify token
 * @param {string} token
 * @returns
 */
export async function verifyTokenService(token) {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (_) {
    return null;
  }
}

/**
 * Create reset password token
 * @param {any} payload
 * @returns
 */
export function createResetPasswordTokenService(payload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.RESET_PASSWORD_TOKEN_TTL_IN_MINUTES + 'm',
  });
}

/**
 * Change password by id
 * @param {*} id
 * @param {*} password
 * @returns
 */
export async function changePasswordByIdService(id, password) {
  const salt = genSaltSync();
  const hashedPassword = hashSync(password, salt);
  return UserModel.findByIdAndUpdate(
    id,
    {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpiresAt: null,
    },
    { new: true },
  )
    .select(USER_SELECTED_FIELDS)
    .lean();
}

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
