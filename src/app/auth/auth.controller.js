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
import { UserAuthDto } from '#src/app/auth/dtos/user-auth.dto';
import { ModelDto } from '#src/core/dto/ModelDto';

export const loginController = async (req) => {
  const { email, password } = req.body;

  const user = await authenticateUserService(email, password);
  if (!user) {
    throw HttpException.new({ code: Code.UNAUTHORIZED, overrideMessage: 'Invalid Credentials' });
  }

  const isNeed2Fa = !user.verifiedAt; // || user.type === USER_TYPE.USER;

  let tokens = null;
  if (!isNeed2Fa) {
    tokens = await generateTokensService(user._id, {
      id: user._id,
      type: user.type,
    });
  }

  const userAuthDto = ModelDto.new(UserAuthDto, user);
  return ApiResponse.success({
    isAuthenticated: !isNeed2Fa,
    is2FactorRequired: isNeed2Fa,
    user: userAuthDto,
    tokens,
  });
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

  const userAuthDto = ModelDto.new(UserAuthDto, customer);
  return ApiResponse.success({
    isAuthenticated: false,
    is2FactorRequired: true,
    user: userAuthDto,
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
  await sendResetPasswordRequestService(email, resetURL);

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

  return ApiResponse.success(null, 'Reset password successfully');
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
  sendOtpCodeService(user.email, userOtp.otp);

  return ApiResponse.success(null, 'Send otp via email successfully');
};

export const verifyOtpController = async (req) => {
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

  const tokens = await generateTokensService(user._id, {
    id: user._id,
    type: user.type,
  });

  const userAuthDto = ModelDto.new(UserAuthDto, user);
  return ApiResponse.success(
    {
      isAuthenticated: true,
      is2FactorRequired: false,
      user: userAuthDto,
      tokens,
    },
    'Verify otp successfully',
  );
};
