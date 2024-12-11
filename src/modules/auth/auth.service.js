import {
  NotFoundException,
  UnauthorizedException,
} from "#src/core/exception/http-exception";
import {
  changePasswordByIdService,
  findUserByIdService,
  updateVerifiedByIdService,
} from "#src/modules/users/users.service";
import { createCustomerService } from "#src/modules/customers/customers.service";
import {
  sendOtpCodeService,
  sendResetPasswordRequestService,
  sendResetPasswordSuccessService,
  sendWelcomeEmailService,
} from "#src/modules/mailer/mailer.service";
import { generateToken } from "#src/utils/jwt.util";
import { USER_TYPES } from "#src/core/constant";
import {
  createUserOtpService,
  findUserOtpByOtpAndUserIdService,
} from "#src/modules/user-otps/user-otps.service";
import { compareHash } from "#src/utils/bcrypt.util";
import {
  createResetPasswordService,
  findResetPasswordByTokenService,
} from "#src/modules/reset-password/reset-password.service";

/**
 * Register customer
 * @param {*} data
 * @returns
 */
export async function registerService(data) {
  const user = await createCustomerService(data);

  return {
    isAuthenticated: false,
    accessToken: null,
    is2FactorRequired: true,
    user: { name: user.name, email: user.email },
  };
}

/**
 * Authenticate user
 * @param {*} data
 * @returns
 */
export async function authenticateService(data) {
  const { email, password } = data;

  const user = await findUserByIdService(
    email,
    "password name email isVerified type"
  );
  if (!user) {
    throw new UnauthorizedException("Invalid Credentials");
  }

  const isMatchPassword = compareHash(password, user.password);
  if (!isMatchPassword) {
    throw new UnauthorizedException("Invalid Credentials");
  }

  // Check unverified or is user => 2FA
  if (!user.isVerified || user.type === USER_TYPES.USER) {
    return {
      isAuthenticated: false,
      accessToken: null,
      is2FactorRequired: true,
      user: { name: user.name, email: user.email },
    };
  }

  const accessToken = generateToken({ userId: user._id });
  return {
    isAuthenticated: true,
    accessToken,
    is2FactorRequired: false,
    user: { name: user.name, email: user.email },
  };
}

/**
 * Send otp via email
 * @param {*} data
 */
export async function sendOtpViaEmailService(data) {
  const { email } = data;
  const user = await findUserByIdService(email);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  const userOtp = await createUserOtpService(user);
  await sendOtpCodeService(user.email, userOtp.otp);
}

/**
 * Verify otp
 * @param {*} data
 * @returns
 */
export async function verifyOtpService(data) {
  const { email, otp } = data;
  const user = await findUserByIdService(email);
  if (!user) {
    throw new UnauthorizedException("Invalid Credentials");
  }

  const userOtp = await findUserOtpByOtpAndUserIdService(otp, user._id);
  if (!userOtp) {
    throw new UnauthorizedException("Invalid or expired otp");
  }

  // Done verify otp
  if (!user.isVerified) {
    await updateVerifiedByIdService(user._id);
    sendWelcomeEmailService(user.email, user.name);
  }

  const accessToken = generateToken({ userId: user._id });
  return {
    isAuthenticated: true,
    accessToken,
    user: { name: user.name, email: user.email },
  };
}

/**
 * Request reset password
 * @param {*} data
 */
export async function forgotPasswordService(data) {
  const { email, callbackUrl } = data;
  const user = await findUserByIdService(email);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  const resetPassword = await createResetPasswordService(user._id);

  const resetURL = `${callbackUrl}/${resetPassword.token}`;
  await sendResetPasswordRequestService(email, resetURL);
}

/**
 * Reset password user
 * @param {*} data
 * @param {*} token
 */
export async function resetPasswordByTokenService(token, data) {
  const { password } = data;
  const resetPassword = await findResetPasswordByTokenService(token);
  if (!resetPassword) {
    throw new UnauthorizedException("Invalid or expired token");
  }

  const updatedUser = await changePasswordByIdService(
    resetPassword.user,
    password
  );
  sendResetPasswordSuccessService(updatedUser.email);
}
