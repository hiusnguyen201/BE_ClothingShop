import {
  revokeTokenByUserIdService,
  refreshTokenService,
  loginUserService,
  loginCustomerService,
  registerService,
  forgotPasswordService,
  resetPasswordService,
  sendOtpViaEmailService,
  verifyOtpService,
} from '#src/app/auth/auth.service';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { UserDto } from '#src/app/users/dtos/user.dto';
import { ModelDto } from '#src/core/dto/ModelDto';
import { clearSession, REFRESH_TOKEN_KEY, setSession } from '#src/utils/session.util';
import { CustomerDto } from '#src/app/customers/dtos/customer.dto';
import { validateSchema } from '#src/core/validations/request.validation';
import { RegisterDto } from '#src/app/auth/dtos/register.dto';
import { LoginDto } from '#src/app/auth/dtos/login.dto';
import { VerifyOtpDto, SendOtpViaEmailDto } from '#src/app/auth/dtos/two-factor.dto';
import { ForgotPasswordDto, ResetPasswordDto } from '#src/app/auth/dtos/forgot-password.dto';
import { DiscordService } from '#src/modules/discord/discord.service';

export const logoutController = async (req, res) => {
  const userId = req.user.id;

  await revokeTokenByUserIdService(userId);

  clearSession(res);

  return ApiResponse.success(null, 'Logout successful');
};

export const refreshTokenController = async (req, res) => {
  const currentRefreshToken = req.cookies[REFRESH_TOKEN_KEY];

  const { accessToken, refreshToken } = await refreshTokenService(currentRefreshToken);

  setSession(res, { accessToken, refreshToken });

  return ApiResponse.success(null, 'Refresh token successful');
};

export const loginAdminController = async (req, res) => {
  const adapter = await validateSchema(LoginDto, req.body);

  const { isAuthenticated, is2FactorRequired, tokens, user } = await loginUserService(adapter.email, adapter.password);

  if (tokens) {
    setSession(res, tokens);

    await DiscordService.sendActivityTestAccount({
      ip: req.ipv4,
      userAgent: req.headers['user-agent'],
      timestamp: new Date(),
    });
  }

  const userDto = ModelDto.new(UserDto, user);
  return ApiResponse.success(
    {
      isAuthenticated,
      is2FactorRequired,
      user: userDto,
    },
    'Login successful',
  );
};

export const loginCustomerController = async (req, res) => {
  const adapter = await validateSchema(LoginDto, req.body);

  const { isAuthenticated, is2FactorRequired, tokens, customer } = await loginCustomerService(
    adapter.email,
    adapter.password,
  );

  if (tokens) {
    setSession(res, tokens);
  }

  const customerDto = ModelDto.new(CustomerDto, customer);
  return ApiResponse.success(
    {
      isAuthenticated,
      is2FactorRequired,
      user: customerDto,
    },
    'Login successful',
  );
};

export const registerController = async (req) => {
  const adapter = await validateSchema(RegisterDto, req.body);

  const { isAuthenticated, is2FactorRequired, customer } = await registerService(adapter);

  const customerDto = ModelDto.new(CustomerDto, customer);
  return ApiResponse.success({
    isAuthenticated,
    is2FactorRequired,
    user: customerDto,
  });
};

export const forgotPasswordController = async (req) => {
  const adapter = await validateSchema(ForgotPasswordDto, req.body);

  await forgotPasswordService(adapter);

  return ApiResponse.success(null, 'Required Forgot Password Success');
};

export const resetPasswordController = async (req) => {
  const adapter = await validateSchema(ResetPasswordDto, req.params);

  await resetPasswordService(adapter);

  return ApiResponse.success(null, 'Reset password successful');
};

export const sendOtpViaEmailController = async (req) => {
  const adapter = await validateSchema(SendOtpViaEmailDto, req.body);

  await sendOtpViaEmailService(adapter);

  return ApiResponse.success(null, 'Send otp via email successful');
};

export const verifyOtpController = async (req, res) => {
  const adapter = await validateSchema(VerifyOtpDto, req.body);

  const { isAuthenticated, is2FactorRequired, user, tokens } = await verifyOtpService(adapter);

  setSession(res, tokens);

  const userDto = ModelDto.new(UserDto, user);
  return ApiResponse.success(
    {
      isAuthenticated,
      is2FactorRequired,
      user: userDto,
    },
    'Verify otp successful',
  );
};
