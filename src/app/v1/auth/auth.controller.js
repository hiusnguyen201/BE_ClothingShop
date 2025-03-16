import path from 'path';
import {
  createUserService,
  getUserByIdService,
  checkExistEmailService,
  updateUserVerifiedByIdService,
  saveUserService,
} from '#src/app/v1/users/users.service';
import {
  authenticateUserService,
  createResetPasswordTokenService,
  verifyTokenService,
  changePasswordByIdService,
} from '#src/app/v1/auth/auth.service';
import {
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  TooManyRequestException,
} from '#src/core/exception/http-exception';
import {
  createUserOtpService,
  checkTimeLeftToResendOTPService,
  getValidUserOtpInUserService,
  removeUserOtpsInUserService,
} from '#src/app/v1/user-otps/user-otps.service';
import {
  sendOtpCodeService,
  sendResetPasswordRequestService,
  sendResetPasswordSuccessService,
  sendWelcomeEmailService,
} from '#src/modules/mailer/mailer.service';
import { ApiResponse } from '#src/core/api/ApiResponse';
import { USER_TYPE } from '#src/app/v1/users/users.constant';
import { generateTokensService } from '#src/app/v1/auth/auth.service';

export const registerController = async (req) => {
  const { email } = req.body;

  const isExistEmail = await checkExistEmailService(email);
  if (isExistEmail) {
    throw new ConflictException('Email already exist');
  }

  const newCustomer = await createUserService({
    ...req.body,
    type: USER_TYPE.CUSTOMER,
  });

  await saveUserService(newCustomer);

  return ApiResponse.success(
    {
      isAuthenticated: false,
      is2FactorRequired: true,
      user: newCustomer._id,
    },
    'Register successfully',
  );
};

export const loginController = async (req) => {
  const { email, password } = req.body;

  const user = await authenticateUserService(email, password);
  if (!user) {
    throw new UnauthorizedException('Invalid Credentials');
  }

  const isNeed2Fa = !user.isVerified; // || user.type === USER_TYPE.USER;

  let tokens = null;
  if (!isNeed2Fa) {
    tokens = await generateTokensService(user._id, {
      id: user._id,
      type: user.type,
    });
  }

  return ApiResponse.success(
    {
      isAuthenticated: !isNeed2Fa,
      is2FactorRequired: isNeed2Fa,
      userId: user._id,
      tokens,
    },
    'Login successfully',
  );
};

export const sendOtpViaEmailController = async (req) => {
  const { email } = req.body;
  const user = await getUserByIdService(email);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  const timeLeft = await checkTimeLeftToResendOTPService(user._id);
  if (timeLeft > 0) {
    throw new TooManyRequestException(`Please wait ${timeLeft} seconds before requesting another OTP`);
  }

  // Remove all otp in user
  await removeUserOtpsInUserService(user._id);

  const userOtp = await createUserOtpService(user._id);
  await sendOtpCodeService(user.email, userOtp.otp);

  return ApiResponse.success(true, 'Send otp via email successfully');
};

export const verifyOtpController = async (req) => {
  const { userId, otp } = req.body;
  const user = await getUserByIdService(userId);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  const userOtp = await getValidUserOtpInUserService(user._id, otp);
  if (!userOtp) {
    throw new UnauthorizedException('Invalid or expired otp');
  }

  if (!user.isVerified) {
    await updateUserVerifiedByIdService(user._id);
    sendWelcomeEmailService(user.email, user.name);
  }

  // Otp valid then remove it
  await removeUserOtpsInUserService(userId);

  const tokens = await generateTokensService(user._id, {
    id: user._id,
    type: user.type,
  });

  return ApiResponse.success(
    {
      isAuthenticated: true,
      user: user._id,
      tokens,
    },
    'Verify otp successfully',
  );
};

export const forgotPasswordController = async (req) => {
  const { email, callbackUrl } = req.body;
  const user = await getUserByIdService(email);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  const token = createResetPasswordTokenService({ id: user._id });

  const resetURL = path.join(callbackUrl, token);
  await sendResetPasswordRequestService(email, resetURL);

  return ApiResponse.success(true, 'Required Forgot Password Success');
};

export const resetPasswordController = async (req) => {
  const { token } = req.params;

  const decoded = await verifyTokenService(token);
  if (!decoded) {
    throw new UnauthorizedException('Invalid or expired token');
  }

  const updatedUser = await changePasswordByIdService(decoded.id, req.body.password);

  sendResetPasswordSuccessService(updatedUser.email);

  return ApiResponse.success(true, 'Reset password successfully');
};
