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
import { validateSchema } from '#src/core/validations/request.validation';
import { RegisterDto } from '#src/app/auth/dtos/register.dto';
import { LoginDto } from '#src/app/auth/dtos/login.dto';
import { VerifyOtpDto, SendOtpViaEmailDto } from '#src/app/auth/dtos/two-factor.dto';
import { ForgotPasswordDto, ResetPasswordDto } from '#src/app/auth/dtos/forgot-password.dto';

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

export const loginAdminController = async (req) => {
  const adapter = await validateSchema(LoginDto, req.body);

  const user = await authenticateUserService(adapter.email, adapter.password);
  if (!user) {
    throw HttpException.new({ code: Code.UNAUTHORIZED, overrideMessage: 'Invalid Credentials' });
  }

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
  const adapter = await validateSchema(LoginDto, req.body);

  const customer = await authenticateCustomerService(adapter.email, adapter.password);
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

  const { accessToken, refreshToken } = await generateTokensService(customer._id, { id: customer._id, type: customer.type });

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
  const adapter = await validateSchema(RegisterDto, req.body);

  const isExistEmail = await checkExistEmailService(adapter.email);
  if (isExistEmail) {
    throw HttpException.new({ code: Code.ALREADY_EXISTS, overrideMessage: 'Email already exist' });
  }

  const customer = await createUserService({
    ...adapter,
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
  const adapter = await validateSchema(ForgotPasswordDto, req.body);

  const user = await getUserByIdService(adapter.email, { type: USER_TYPE.CUSTOMER });
  if (!user) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' });
  }

  const token = createResetPasswordTokenService({ id: user._id });

  const resetURL = path.join(adapter.callbackUrl, token);
  const result = await sendResetPasswordRequestService(user.email, resetURL);
  if (!result) {
    throw HttpException.new({ code: Code.SEND_MAIL_ERROR, overrideMessage: 'Send link reset password failed' });
  }

  return ApiResponse.success(null, 'Required Forgot Password Success');
};

export const resetPasswordController = async (req) => {
  const adapter = await validateSchema(ResetPasswordDto, req.params);

  const decoded = await verifyTokenService(adapter.token);
  if (!decoded) {
    throw HttpException.new({ code: Code.UNAUTHORIZED, overrideMessage: 'Invalid or expired token' });
  }

  const updatedUser = await changePasswordByIdService(decoded.id, req.body.password);

  sendResetPasswordSuccessService(updatedUser.email);

  return ApiResponse.success(null, 'Reset password successful');
};

export const sendOtpViaEmailController = async (req) => {
  const adapter = await validateSchema(SendOtpViaEmailDto, req.body);

  const user = await getUserByIdService(adapter.email);
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
  const adapter = await validateSchema(VerifyOtpDto, req.body);

  const user = await getUserByIdService(adapter.userId);
  if (!user) {
    throw HttpException.new({ code: Code.RESOURCE_NOT_FOUND, overrideMessage: 'User not found' });
  }

  const userOtp = await getValidUserOtpInUserService(user._id, adapter.otp);
  if (!userOtp) {
    throw HttpException.new({ code: Code.UNAUTHORIZED, overrideMessage: 'Invalid or expired otp' });
  }

  if (!user.verifiedAt) {
    await updateUserVerifiedByIdService(user._id);
    sendWelcomeEmailService(user.email, user.name);
  }

  // Otp valid then remove it
  await removeUserOtpsInUserService(user._id);

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
