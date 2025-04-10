'use strict';
import path from 'path';
import {
  createUserService,
  getUserByIdService,
  checkExistEmailService,
  updateUserVerifiedByIdService,
} from '#src/app/users/users.service';
import {
  authenticateUserService,
  createResetPasswordTokenService,
  verifyTokenService,
  changePasswordByIdService,
  createUserOtpService,
  checkTimeLeftToResendOTPService,
  getValidUserOtpInUserService,
  removeUserOtpsInUserService,
  revokeTokenByUserIdService,
  getUserByRefreshTokenService,
  authenticateCustomerService,
} from '#src/app/auth/auth.service';
import { HttpException } from '#src/core/exception/http-exception';
import {
  sendOtpCodeService,
  sendResetPasswordRequestService,
  sendResetPasswordSuccessService,
  sendWelcomeEmailService,
} from '#src/modules/mailer/mailer.service';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { USER_TYPE } from '#src/app/users/users.constant';
import { generateTokensService } from '#src/app/auth/auth.service';
import { Code } from '#src/core/code/Code';
import { UserDto } from '#src/app/users/dtos/user.dto';
import { ModelDto } from '#src/core/dto/ModelDto';
import { clearSession, REFRESH_TOKEN_KEY, setSession } from '#src/utils/cookie.util';
import { CustomerDto } from '#src/app/customers/dtos/customer.dto';

export const logoutController = async (req, res) => {
  const userId = req.user.id;

  await revokeTokenByUserIdService(userId);

  clearSession(res);

  return ApiResponse.success(null);
};

export const refreshTokenController = async (req, res) => {
  const currentRefreshToken = req.cookies[REFRESH_TOKEN_KEY];

  if (!currentRefreshToken) {
    throw HttpException.new({ code: Code.REFRESH_TOKEN_FAILED, message: 'No refresh token provided' });
  }

  const user = await getUserByRefreshTokenService(currentRefreshToken);
  if (!user) {
    throw HttpException.new({ code: Code.REFRESH_TOKEN_FAILED, message: 'Invalid refresh token' });
  }

  const { accessToken, refreshToken } = await generateTokensService(user._id, {
    id: user._id,
    type: user.type,
  });

  setSession(res, { accessToken, refreshToken });

  const userDto = ModelDto.new(UserDto, user);
  return ApiResponse.success(userDto, 'Refresh token successful');
};

export const loginAdminController = async (req, res) => {
  const { email, password } = req.body;

  const user = await authenticateUserService(email, password);
  if (!user) {
    throw HttpException.new({ code: Code.UNAUTHORIZED, overrideMessage: 'Invalid Credentials' });
  }

  const { accessToken, refreshToken } = await generateTokensService(user._id, { id: user._id });

  setSession(res, { accessToken, refreshToken });

  const userDto = ModelDto.new(UserDto, user);

  return ApiResponse.success(
    {
      isAuthenticated: false,
      is2FactorRequired: true,
      user: userDto,
    },
    'Login successful',
  );
};

export const loginCustomerController = async (req, res) => {
  const { email, password } = req.body;

  const customer = await authenticateCustomerService(email, password);
  if (!customer) {
    throw HttpException.new({ code: Code.UNAUTHORIZED, overrideMessage: 'Invalid Credentials' });
  }

  const customerDto = ModelDto.new(CustomerDto, customer);
  const isNeed2Fa = !customer.verifiedAt;
  if (isNeed2Fa) {
    return ApiResponse.success({
      isAuthenticated: false,
      is2FactorRequired: true,
      customer: customerDto,
    });
  }

  const { accessToken, refreshToken } = await generateTokensService(customer._id, { id: customer._id });

  setSession(res, { accessToken, refreshToken });

  return ApiResponse.success(
    {
      isAuthenticated: true,
      is2FactorRequired: false,
      customer: customerDto,
    },
    'Login successful',
  );
};

export const registerController = async (req) => {
  const { email } = req.body;

  const isExistEmail = await checkExistEmailService(email);
  if (isExistEmail) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Email already exist' });
  }

  const customer = await createUserService({
    ...req.body,
    type: USER_TYPE.CUSTOMER,
  });

  const userDto = ModelDto.new(UserDto, customer);
  return ApiResponse.success({
    isAuthenticated: false,
    is2FactorRequired: true,
    user: userDto,
  });
};

export const forgotPasswordController = async (req) => {
  const { email, callbackUrl } = req.body;
  const user = await getUserByIdService(email, { type: USER_TYPE.CUSTOMER });
  if (!user) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' });
  }

  const token = createResetPasswordTokenService({ id: user._id });

  const resetURL = path.join(callbackUrl, token);
  const result = await sendResetPasswordRequestService(email, resetURL);
  if (!result) {
    throw HttpException.new({ code: Code.SEND_MAIL_ERROR, overrideMessage: 'Send link reset password failed' });
  }

  return ApiResponse.success(null, 'Required Forgot Password Success');
};

export const resetPasswordController = async (req) => {
  const { token } = req.params;

  const decoded = await verifyTokenService(token);
  if (!decoded) {
    throw HttpException.new({ code: Code.UNAUTHORIZED, overrideMessage: 'Invalid or expired token' });
  }

  const updatedUser = await changePasswordByIdService(decoded.id, req.body.password);

  sendResetPasswordSuccessService(updatedUser.email);

  return ApiResponse.success(null, 'Reset password successful');
};

export const sendOtpViaEmailController = async (req) => {
  const { email } = req.body;
  const user = await getUserByIdService(email);
  if (!user) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' });
  }

  const timeLeft = await checkTimeLeftToResendOTPService(user._id);
  if (timeLeft > 0) {
    throw HttpException.new({
      code: Code.TOO_MANY_SEND_MAIL,
      overrideMessage: `Please wait ${timeLeft} seconds before requesting another OTP`,
    });
  }

  // Remove all otp in user
  await removeUserOtpsInUserService(user._id);

  const userOtp = await createUserOtpService(user._id);
  const result = await sendOtpCodeService(user.email, userOtp.otp);
  if (!result) {
    throw HttpException.new({ code: Code.SEND_MAIL_ERROR, overrideMessage: 'Send OTP failed' });
  }

  return ApiResponse.success(null, 'Send otp via email successful');
};

export const verifyOtpController = async (req, res) => {
  const { userId, otp } = req.body;
  const user = await getUserByIdService(userId);
  if (!user) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' });
  }

  const userOtp = await getValidUserOtpInUserService(user._id, otp);
  if (!userOtp) {
    throw HttpException.new({ code: Code.UNAUTHORIZED, overrideMessage: 'Invalid or expired otp' });
  }

  if (!user.verifiedAt) {
    await updateUserVerifiedByIdService(user._id);
    sendWelcomeEmailService(user.email, user.name);
  }

  // Otp valid then remove it
  await removeUserOtpsInUserService(userId);

  const { accessToken, refreshToken } = await generateTokensService(user._id, {
    id: user._id,
    type: user.type,
  });

  setSession(res, { accessToken, refreshToken });

  const userDto = ModelDto.new(UserDto, user);
  return ApiResponse.success(
    {
      isAuthenticated: true,
      is2FactorRequired: false,
      user: userDto,
    },
    'Verify otp successful',
  );
};
