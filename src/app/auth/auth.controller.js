import HttpStatus from 'http-status-codes';
import path from 'path';
import {
  createUserService,
  getUserByIdService,
  checkExistEmailService,
  updateUserAvatarByIdService,
  updateUserVerifiedByIdService,
  changePasswordByIdService,
} from '#app/users/users.service';
import { UnauthorizedException, ConflictException, NotFoundException } from '#core/exception/http-exception';
import { generateToken } from '#utils/jwt.util';
import { USER_TYPES } from '#core/constant';
import { createUserOtpService, getUserOtpByOtpAndUserIdService } from '#app/user-otps/user-otps.service';
import {
  sendOtpCodeService,
  sendResetPasswordRequestService,
  sendResetPasswordSuccessService,
  sendWelcomeEmailService,
} from '#modules/mailer/mailer.service';
import { createResetPasswordService, getResetPasswordByTokenService } from '#app/reset-password/reset-password.service';
import { compareSync } from 'bcrypt';

export const registerController = async (req) => {
  const { email } = req.body;
  const isExistEmail = await checkExistEmailService(email);
  if (isExistEmail) {
    throw new ConflictException('Email already exist');
  }

  const newCustomer = await createUserService({
    ...req.body,
    type: USER_TYPES.CUSTOMER,
  });

  if (req.file) {
    return await updateUserAvatarByIdService(newCustomer._id, req.file);
  }

  return {
    statusCode: HttpStatus.OK,
    message: 'Register successfully',
    data: {
      isAuthenticated: false,
      accessToken: null,
      is2FactorRequired: true,
      user: {
        _id: newCustomer._id,
        name: newCustomer.name,
        email: newCustomer.email,
      },
    },
  };
};

export const loginController = async (req) => {
  const { email, password } = req.body;

  const user = await getUserByIdService(email, '_id password name email isVerified type');

  if (!user) {
    throw new UnauthorizedException('Invalid Credentials');
  }

  const isMatchPassword = compareSync(password, user.password);
  if (!isMatchPassword) {
    throw new UnauthorizedException('Invalid Credentials');
  }

  const isNeed2Fa = !user.isVerified; // || user.type === USER_TYPES.USER;

  return {
    statusCode: HttpStatus.OK,
    message: 'Login successfully',
    data: {
      isAuthenticated: !isNeed2Fa,
      accessToken: isNeed2Fa ? null : generateToken({ _id: user._id }),
      is2FactorRequired: isNeed2Fa,
      user: { _id: user._id, name: user.name, email: user.email },
    },
  };
};

export const sendOtpViaEmailController = async (req) => {
  const { email } = req.body;
  const user = await getUserByIdService(email);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  const userOtp = await createUserOtpService(user._id);
  await sendOtpCodeService(user.email, userOtp.otp);

  return {
    statusCode: HttpStatus.NO_CONTENT,
    message: 'Send otp via email successfully',
  };
};

export const verifyOtpController = async (req) => {
  const { email, otp } = req.body;
  const user = await getUserByIdService(email, '_id email name isVerified');
  if (!user) {
    throw new NotFoundException('User not found');
  }

  const userOtp = await getUserOtpByOtpAndUserIdService(otp, user._id);
  if (!userOtp) {
    throw new UnauthorizedException('Invalid or expired otp');
  }

  if (!user.isVerified) {
    await updateUserVerifiedByIdService(user._id);
    sendWelcomeEmailService(user.email, user.name);
  }

  const accessToken = generateToken({ _id: user._id });
  return {
    statusCode: HttpStatus.OK,
    message: 'Verify otp successfully',
    data: {
      isAuthenticated: true,
      accessToken,
      user: { _id: user._id, name: user.name, email: user.email },
    },
  };
};

export const forgotPasswordController = async (req) => {
  const { email, callbackUrl } = req.body;
  const user = await getUserByIdService(email);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  const resetPassword = await createResetPasswordService(user._id);

  const resetURL = path.join(callbackUrl, resetPassword.token);
  await sendResetPasswordRequestService(email, resetURL);

  return {
    statusCode: HttpStatus.NO_CONTENT,
    message: 'Required Forgot Password Success',
  };
};

export const resetPasswordController = async (req) => {
  const { token } = req.params;
  const resetPassword = await getResetPasswordByTokenService(token);
  if (!resetPassword) {
    throw new UnauthorizedException('Invalid or expired token');
  }

  const { password } = req.body;
  const updatedUser = await changePasswordByIdService(resetPassword.user, password);

  await sendResetPasswordSuccessService(updatedUser.email);

  return {
    statusCode: HttpStatus.NO_CONTENT,
    message: 'Reset password successfully',
  };
};
