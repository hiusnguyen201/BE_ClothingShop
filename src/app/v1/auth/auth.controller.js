import HttpStatus from 'http-status-codes';
import path from 'path';
import {
  createUserService,
  getUserByIdService,
  checkExistEmailService,
  updateUserAvatarByIdService,
  updateUserVerifiedByIdService,
  changePasswordByIdService,
} from '#app/v1/users/users.service';
import {
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  TooManyRequestException,
} from '#core/exception/http-exception';
import { generateToken } from '#utils/jwt.util';
import { UserConstant } from '#app/v2/users/UserConstant';
import {
  createUserOtpService,
  getCurrentUserOtpService,
  getUserOtpByOtpAndUserIdService,
  removeUserOtpById,
} from '#src/app/v1/user-otps/user-otps.service';
import {
  sendOtpCodeService,
  sendResetPasswordRequestService,
  sendResetPasswordSuccessService,
  sendWelcomeEmailService,
} from '#modules/mailer/mailer.service';
import {
  createResetPasswordService,
  getResetPasswordByTokenService,
} from '#src/app/v1/reset-password/reset-password.service';
import { compareSync } from 'bcrypt';
import { generateNumericOTP } from '#src/utils/string.util';

export const registerController = async (req) => {
  const { email } = req.body;
  const isExistEmail = await checkExistEmailService(email);
  if (isExistEmail) {
    throw new ConflictException('Email already exist');
  }

  const newCustomer = await createUserService({
    ...req.body,
    type: UserConstant.USER_TYPES.CUSTOMER,
  });

  if (req.file) {
    return await updateUserAvatarByIdService(newCustomer._id, req.file);
  }

  const userOtp = await createUserOtpService(newCustomer._id);
  sendOtpCodeService(email, userOtp.otp);

  return {
    statusCode: HttpStatus.OK,
    message: 'Register successfully',
    data: {
      isAuthenticated: false,
      accessToken: null,
      is2FactorRequired: true,
      user: { id: newCustomer._id, name: newCustomer.name, email: newCustomer.email },
    },
  };
};

export const loginController = async (req) => {
  const { email, password } = req.body;

  const user = await getUserByIdService(email, 'id password name email isVerified type');

  if (!user) {
    throw new UnauthorizedException('Invalid Credentials');
  }

  const isMatchPassword = compareSync(password, user.password);
  if (!isMatchPassword) {
    throw new UnauthorizedException('Invalid Credentials');
  }

  const isNeed2Fa = !user.isVerified; // || user.type === UserConstant.USER_TYPES.USER;

  return {
    statusCode: HttpStatus.OK,
    message: 'Login successfully',
    data: {
      isAuthenticated: !isNeed2Fa,
      accessToken: isNeed2Fa ? null : generateToken({ _id: user._id }),
      is2FactorRequired: isNeed2Fa,
      user: { id: user._id, name: user.name, email: user.email, type: user.type },
    },
  };
};

export const sendOtpViaEmailController = async (req) => {
  const { email } = req.body;
  const user = await getUserByIdService(email);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  const existValidOtp = await getCurrentUserOtpService(user._id);
  if (existValidOtp && moment().isBefore(existValidOtp.resendDate)) {
    const timeLeft = moment(existValidOtp.resendDate).diff(moment(), 'seconds');
    throw new TooManyRequestException(`Please wait ${timeLeft} seconds before requesting another OTP.`);
  } else if (existValidOtp) {
    await removeUserOtpById(existValidOtp._id);
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
  const user = await getUserByIdService(email, 'id email name isVerified type');
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

  await removeUserOtpById(userOtp._id);

  const accessToken = generateToken({ id: user._id });
  return {
    statusCode: HttpStatus.OK,
    message: 'Verify otp successfully',
    data: {
      isAuthenticated: true,
      accessToken,
      user: { _id: user._id, name: user.name, email: user.email, type: user.type },
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
