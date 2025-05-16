import { compareSync } from 'bcrypt';
import { USER_SELECTED_FIELDS } from '#src/app/users/users.constant';
import {
  checkExistEmailRepository,
  clearRefreshTokenByIdRepository,
  getProfileByIdRepository,
  getUserByEmailRepository,
  getUserByRefreshTokenRepository,
  updatePasswordByIdService,
  updateRefreshTokenByIdRepository,
  updateUserVerifiedByIdRepository,
} from '#src/app/users/users.repository';
import { Assert } from '#src/core/assert/Assert';
import { HttpException } from '#src/core/exception/http-exception';
import { Code } from '#src/core/code/Code';
import { generateResetPasswordToken, generateTokens, verifyToken } from '#src/utils/session.util';
import { createCustomerRepository, getCustomerByEmailRepository } from '#src/app/customers/customers.repository';
import { CUSTOMER_SELECTED_FIELDS } from '#src/app/customers/customers.constant';
import {
  sendOtpCodeService,
  sendResetPasswordRequestService,
  sendResetPasswordSuccessService,
  sendWelcomeEmailService,
} from '#src/modules/mailer/mailer.service';
import {
  createUserOtpRepository,
  getValidUserOtpInUserRepository,
  removeUserOtpsInUserRepository,
} from '#src/app/auth/auth.repository';
import { notifyClientsOfNewCustomer } from '#src/app/notifications/notifications.service';

/**
 * Revoke token
 * @param {string} email
 * @param {string} password
 * @returns
 */
export async function revokeTokenByUserIdService(userId) {
  await clearRefreshTokenByIdRepository(userId);
}

/**
 * Refresh token
 * @param {string} token
 * @returns
 */
export async function refreshTokenService(token) {
  Assert.isTrue(token, HttpException.new({ code: Code.REFRESH_TOKEN_FAILED, message: 'No refresh token provided' }));

  const user = await getUserByRefreshTokenRepository(token);
  Assert.isTrue(user, HttpException.new({ code: Code.REFRESH_TOKEN_FAILED, message: 'Invalid refresh token' }));

  const { accessToken, refreshToken } = await generateTokens({
    id: user._id,
    type: user.type,
  });

  await updateRefreshTokenByIdRepository(user._id, refreshToken);

  return { accessToken, refreshToken };
}

/**
 * Login User
 * @param {string} email
 * @param {string} password
 * @returns
 */
export async function loginUserService(email, password) {
  const user = await getUserByEmailRepository(email, { ...USER_SELECTED_FIELDS, password: true });
  Assert.isTrue(
    user && compareSync(password, user.password),
    HttpException.new({ code: Code.UNAUTHORIZED, overrideMessage: 'Invalid Credentials' }),
  );

  delete user.password;

  let tokens = null;
  const isTestAccount = user.email === 'test@gmail.com';
  if (isTestAccount) {
    tokens = await generateTokens({ id: user._id, type: user.type });
    await updateRefreshTokenByIdRepository(user._id, tokens.refreshToken);
  }

  return {
    isAuthenticated: isTestAccount,
    is2FactorRequired: !isTestAccount,
    user,
    tokens,
  };
}

/**
 * Login Customer
 * @param {string} email
 * @param {string} password
 * @returns
 */
export async function loginCustomerService(email, password) {
  const customer = await getCustomerByEmailRepository(email, { ...CUSTOMER_SELECTED_FIELDS, password: true });
  Assert.isTrue(
    customer && compareSync(password, customer.password),
    HttpException.new({ code: Code.UNAUTHORIZED, overrideMessage: 'Invalid Credentials' }),
  );

  delete customer.password;

  let tokens = null;
  const isNeed2Fa = !customer.verifiedAt;
  if (isNeed2Fa) {
    tokens = await generateTokens({ id: customer._id, type: customer.type });
    await updateRefreshTokenByIdRepository(customer._id, tokens.refreshToken);
  }

  return {
    isAuthenticated: !isNeed2Fa,
    is2FactorRequired: isNeed2Fa,
    customer,
    tokens,
  };
}

/**
 * Register Customer
 * @param {RegisterPort} payload
 * @returns
 */
export async function registerService(payload) {
  const isExistEmail = await checkExistEmailRepository(payload.email);
  Assert.isFalse(
    isExistEmail,
    HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Email already exist' }),
  );

  const customer = await createCustomerRepository(payload);

  // Notify to client
  await notifyClientsOfNewCustomer({
    customerId: customer._id,
    name: customer.name,
    email: customer.email,
  });

  return {
    isAuthenticated: false,
    is2FactorRequired: true,
    customer,
    tokens: null,
  };
}

/**
 * Forgot password
 * @param {ForgotPasswordPort} payload
 * @returns
 */
export async function forgotPasswordService(payload) {
  const user = await getCustomerByEmailRepository(payload.email);
  Assert.isTrue(user, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'Email is not exist' }));

  const token = generateResetPasswordToken({ id: user._id });

  const resetURL = payload.callbackUrl + '/' + token;

  const result = await sendResetPasswordRequestService(user.email, resetURL);
  Assert.isTrue(
    result,
    HttpException.new({ code: Code.SEND_MAIL_ERROR, overrideMessage: 'Send link reset password failed' }),
  );
}

/**
 * Reset password
 * @param {ResetPasswordPort} payload
 * @returns
 */
export async function resetPasswordService(payload) {
  const decoded = await verifyToken(payload.token);
  Assert.isTrue(decoded, HttpException.new({ code: Code.UNAUTHORIZED, overrideMessage: 'Invalid or expired token' }));

  const updatedUser = await updatePasswordByIdService(decoded.id, payload.password);

  const result = await sendResetPasswordSuccessService(updatedUser.email);
  Assert.isTrue(
    result,
    HttpException.new({ code: Code.SEND_MAIL_ERROR, overrideMessage: "Send 'reset password success' failed" }),
  );
}

/**
 * Send Otp via email
 * @param {SendOtpViaEmailDto} payload
 * @returns
 */
export async function sendOtpViaEmailService(payload) {
  const profile = await getProfileByIdRepository(payload.email);

  Assert.isTrue(profile, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' }));

  // Remove all otp in user
  await removeUserOtpsInUserRepository(profile._id);

  const userOtp = await createUserOtpRepository(profile._id);
  const result = await sendOtpCodeService(profile.email, userOtp.otp);
  Assert.isTrue(result, HttpException.new({ code: Code.SEND_MAIL_ERROR, overrideMessage: 'Send OTP failed' }));
}

/**
 * Verify otp
 * @param {VerifyOtpDto} payload
 * @returns
 */
export async function verifyOtpService(payload) {
  let user = await getProfileByIdRepository(payload.userId);
  Assert.isTrue(user, HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' }));

  const userOtp = await getValidUserOtpInUserRepository(user._id, payload.otp);
  Assert.isTrue(userOtp, HttpException.new({ code: Code.UNAUTHORIZED, overrideMessage: 'Invalid or expired otp' }));

  if (!user.verifiedAt) {
    user = await updateUserVerifiedByIdRepository(user._id);

    // Clear cache
    await deleteUserFromCache(user._id);

    await sendWelcomeEmailService(user.email, user.name);
  }

  // Otp valid then remove it
  await removeUserOtpsInUserRepository(user._id);

  const tokens = await generateTokens({ id: user._id, type: user.type });

  return { isAuthenticated: true, is2FactorRequired: false, user, tokens };
}
